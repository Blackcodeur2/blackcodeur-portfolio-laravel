<?php

namespace App\Http\Controllers;

use App\Models\Devis;
use App\Models\Enterprise;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Inertia\Response as InertiaResponse;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): InertiaResponse
    {
        $query = Project::with('enterprises');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->filled('enterprise_id')) {
            if ($request->input('enterprise_id') === 'none') {
                $query->whereNull('enterprise_id');
            } else {
                $query->where('enterprise_id', $request->input('enterprise_id'));
            }
        }

        if ($request->filled('status')) {
            $isFinished = $request->input('status') === 'finished';
            $query->where('is_finished', $isFinished);
        }

        $projects = $query->latest()->get();

        $enterprises = Enterprise::select('id', 'name')->get();
        $enterprises->prepend((object) ['id' => 'none', 'name' => 'Sans entreprise']);

        return Inertia::render('projects', [
            'projects' => $projects,
            'enterprises' => $enterprises,
            'filters' => $request->only(['search', 'enterprise_id', 'status']),
        ]);
    }

    /**
     * Display the dashboard statistics.
     */
    public function dashboard(): InertiaResponse
    {
        $totalEnterprises = Enterprise::count();
        $totalProjects = Project::count();
        $finishedProjects = Project::where('is_finished', true)->count();
        $activeProjects = Project::where('is_finished', false)->count();
        $totalDevis = Devis::count();

        // Count enterprises by outreach status
        $statusBreakdown = [
            'prospect' => Enterprise::where('outreach_status', 'prospect')->count(),
            'contacted' => Enterprise::where('outreach_status', 'contacted')->count(),
            'negotiating' => Enterprise::where('outreach_status', 'negotiating')->count(),
            'signed' => Enterprise::where('outreach_status', 'signed')->count(),
            'refused' => Enterprise::where('outreach_status', 'refused')->count(),
        ];

        // Recent enterprises added
        $recentEnterprises = Enterprise::with('categorie')
            ->latest()
            ->limit(5)
            ->get();

        // Recent projects
        $recentProjects = Project::with('enterprises')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_enterprises' => $totalEnterprises,
                'total_projects' => $totalProjects,
                'finished_projects' => $finishedProjects,
                'active_projects' => $activeProjects,
                'total_devis' => $totalDevis,
                'status_breakdown' => $statusBreakdown,
            ],
            'recent_enterprises' => $recentEnterprises,
            'recent_projects' => $recentProjects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enterprise_id' => 'nullable|exists:enterprises,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'required|boolean',
            'is_published' => 'required|boolean',
            'public_link' => 'nullable|url|max:255',
            'github_link' => 'nullable|url|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('projects', 'supabase');
        }

        Project::create($validated);

        return redirect()->route('projects.index')->with('success', 'Projet créé avec succès.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'enterprise_id' => 'nullable|exists:enterprises,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'required|boolean',
            'is_published' => 'required|boolean',
            'public_link' => 'nullable|url|max:255',
            'github_link' => 'nullable|url|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($project->logo) {
                Storage::disk('supabase')->delete($project->logo);
            }
            $validated['logo'] = $request->file('logo')->store('projects', 'supabase');
        }

        $project->update($validated);

        return redirect()->route('projects.index')->with('success', 'Projet mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        if ($project->logo) {
            Storage::disk('supabase')->delete($project->logo);
        }

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Projet supprimé avec succès.');
    }
}
