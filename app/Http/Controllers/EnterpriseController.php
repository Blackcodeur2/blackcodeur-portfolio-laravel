<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Enterprise;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class EnterpriseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return InertiaResponse
     */
    public function index(Request $request): InertiaResponse
    {
        $query = Enterprise::with('categorie');

        // Apply search filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email_address', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('outreach_status')) {
            $query->where('outreach_status', $request->input('outreach_status'));
        }

        if ($request->filled('has_website')) {
            $hasWebsite = $request->input('has_website') === 'true' || $request->input('has_website') === '1';
            $query->where('has_website', $hasWebsite);
        }

        $enterprises = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('enterprises', [
            'enterprises' => $enterprises,
            'categories' => Category::all(),
            'filters' => $request->only(['search', 'category_id', 'outreach_status', 'has_website']),
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
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:enterprises,name',
            'description' => 'nullable|string',
            'email_address' => 'required|email|max:255|unique:enterprises,email_address',
            'google_maps_link' => 'required|url|max:255|unique:enterprises,google_maps_link',
            'telephone' => 'required|string|max:50|unique:enterprises,telephone',
            'website' => 'nullable|url|max:255',
            'has_website' => 'required|boolean',
            'address' => 'required|string|max:255',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews_count' => 'nullable|integer|min:0',
            'outreach_status' => 'required|string|in:prospect,contacted,negotiating,signed,refused',
        ]);

        Enterprise::create($validated);

        return redirect()->route('enterprises.index')->with('success', 'Entreprise créée avec succès.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param Enterprise $enterprise
     * @return RedirectResponse
     */
    public function update(Request $request, Enterprise $enterprise): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:enterprises,name,' . $enterprise->id,
            'description' => 'nullable|string',
            'email_address' => 'required|email|max:255|unique:enterprises,email_address,' . $enterprise->id,
            'google_maps_link' => 'required|url|max:255|unique:enterprises,google_maps_link,' . $enterprise->id,
            'telephone' => 'required|string|max:50|unique:enterprises,telephone,' . $enterprise->id,
            'website' => 'nullable|url|max:255',
            'has_website' => 'required|boolean',
            'address' => 'required|string|max:255',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews_count' => 'nullable|integer|min:0',
            'outreach_status' => 'required|string|in:prospect,contacted,negotiating,signed,refused',
        ]);

        $enterprise->update($validated);

        return redirect()->route('enterprises.index')->with('success', 'Entreprise mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Enterprise $enterprise
     * @return RedirectResponse
     */
    public function destroy(Enterprise $enterprise): RedirectResponse
    {
        $enterprise->delete();

        return redirect()->route('enterprises.index')->with('success', 'Entreprise supprimée avec succès.');
    }
}
