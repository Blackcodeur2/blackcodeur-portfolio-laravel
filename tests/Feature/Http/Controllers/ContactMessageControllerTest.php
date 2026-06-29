<?php

use App\Models\ContactMessage;
use App\Models\User;

test('public visitors can submit a contact message', function () {
    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'Hello, I would like a quote for a website.',
    ];

    $response = $this->post(route('contact.store'), $data);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('contact_messages', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);
});

test('public contact form validation fails on empty fields', function () {
    $response = $this->post(route('contact.store'), [
        'name' => '',
        'email' => 'not-an-email',
        'message' => '',
    ]);

    $response->assertSessionHasErrors(['name', 'email', 'message']);
    $this->assertDatabaseCount('contact_messages', 0);
});

test('guests are redirected to the login page from admin endpoints', function () {
    $message = ContactMessage::factory()->create();

    $this->get(route('contact-messages.index'))
        ->assertRedirect(route('login'));

    $this->patch(route('contact-messages.read', $message))
        ->assertRedirect(route('login'));

    $this->delete(route('contact-messages.destroy', $message))
        ->assertRedirect(route('login'));
});

test('authenticated users can view the contact messages list', function () {
    $user = User::factory()->create();
    ContactMessage::factory()->count(5)->create();

    $this->actingAs($user)
        ->get(route('contact-messages.index'))
        ->assertOk();
});

test('authenticated users can mark a message as read', function () {
    $user = User::factory()->create();
    $message = ContactMessage::factory()->create(['read_at' => null]);

    $this->actingAs($user)
        ->patch(route('contact-messages.read', $message))
        ->assertRedirect();

    expect($message->fresh()->isRead())->toBeTrue();
});

test('authenticated users can delete a message', function () {
    $user = User::factory()->create();
    $message = ContactMessage::factory()->create();

    $this->actingAs($user)
        ->delete(route('contact-messages.destroy', $message))
        ->assertRedirect();

    $this->assertDatabaseMissing('contact_messages', [
        'id' => $message->id,
    ]);
});
