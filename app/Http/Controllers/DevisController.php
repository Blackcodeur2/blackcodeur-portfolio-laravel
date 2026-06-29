<?php

namespace App\Http\Controllers;

use App\Models\Devis;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DevisController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return InertiaResponse
     */
    public function index(): InertiaResponse
    {
        $devis = Devis::with('project.enterprises')->latest()->get();

        return Inertia::render('devis', [
            'devis' => $devis,
            'projects' => Project::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'content' => 'required|string',
            'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,txt|max:10240', // max 10MB
        ]);

        $filePath = null;
        if ($request->hasFile('document')) {
            $filePath = $request->file('document')->store('devis', 'public');
        }

        Devis::create([
            'project_id' => $request->input('project_id'),
            'content' => $request->input('content'),
            'document' => $filePath,
        ]);

        return redirect()->route('devis.index')->with('success', 'Devis téléchargé avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Devis $devis
     * @return RedirectResponse
     */
    public function destroy(Devis $devis): RedirectResponse
    {
        if ($devis->document && Storage::disk('public')->exists($devis->document)) {
            Storage::disk('public')->delete($devis->document);
        }

        $devis->delete();

        return redirect()->route('devis.index')->with('success', 'Devis supprimé avec succès.');
    }
}
