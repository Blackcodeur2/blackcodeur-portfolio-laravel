<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ContactMessageController extends Controller
{
    /**
     * Display all messages (admin area).
     */
    public function index(): InertiaResponse
    {
        $messages = ContactMessage::latest()->paginate(20);

        return Inertia::render('contact-messages/index', [
            'messages' => $messages,
            'unreadCount' => ContactMessage::unread()->count(),
        ]);
    }

    /**
     * Store a new message from the public contact form.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        ContactMessage::create($validated);

        return back()->with('success', 'Votre message a bien été envoyé.');
    }

    /**
     * Mark a message as read.
     */
    public function markRead(ContactMessage $contactMessage): RedirectResponse
    {
        if (! $contactMessage->isRead()) {
            $contactMessage->update(['read_at' => now()]);
        }

        return back()->with('success', 'Message marqué comme lu.');
    }

    /**
     * Delete a message.
     */
    public function destroy(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->delete();

        return back()->with('success', 'Message supprimé avec succès.');
    }
}
