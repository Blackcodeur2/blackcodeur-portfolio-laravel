<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectGallery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ProjectGalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return InertiaResponse
     */
    public function index(): InertiaResponse
    {
        $galleries = ProjectGallery::with('project.enterprises')->latest()->get();

        return Inertia::render('gallery', [
            'galleries' => $galleries,
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
            'description' => 'nullable|string|max:1000',
            'image_item' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // max 5MB
        ]);

        $filePath = null;
        if ($request->hasFile('image_item')) {
            $filePath = $request->file('image_item')->store('gallery', 'vercel');
        }

        ProjectGallery::create([
            'project_id' => $request->input('project_id'),
            'description' => $request->input('description'),
            'image_item' => $filePath,
        ]);

        return redirect()->route('gallery.index')->with('success', 'Image ajoutée à la galerie avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param ProjectGallery $gallery
     * @return RedirectResponse
     */
    public function destroy(ProjectGallery $gallery): RedirectResponse
    {
        if ($gallery->image_item && Storage::disk('vercel')->exists($gallery->image_item)) {
            Storage::disk('vercel')->delete($gallery->image_item);
        }

        $gallery->delete();

        return redirect()->route('gallery.index')->with('success', 'Image supprimée de la galerie avec succès.');
    }
}
