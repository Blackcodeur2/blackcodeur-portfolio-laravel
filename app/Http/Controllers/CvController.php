<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class CvController extends Controller
{
    /**
     * Display the CV inline in the browser.
     */
    public function show(Request $request): Response
    {
        $profile = Profile::first();

        abort_unless($profile && $profile->cv, 404);

        return $this->streamCv($profile->cv, 'inline');
    }

    /**
     * Download the CV.
     */
    public function download(Request $request): Response
    {
        $profile = Profile::first();

        abort_unless($profile && $profile->cv, 404);

        return $this->streamCv($profile->cv, 'attachment');
    }

    protected function streamCv(string $path, string $disposition): Response
    {
        abort_unless(Storage::disk('supabase')->exists($path), 404);

        $contents = Storage::disk('supabase')->get($path);
        $filename = 'CV-'.date('Y').'.pdf';

        return response($contents, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('%s; filename="%s"', $disposition, $filename),
        ]);
    }
}
