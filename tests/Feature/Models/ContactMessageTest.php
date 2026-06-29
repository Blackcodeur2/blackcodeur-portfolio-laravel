<?php

use App\Models\ContactMessage;

test('it can check if a message is read or unread', function () {
    $unreadMessage = ContactMessage::factory()->create(['read_at' => null]);
    $readMessage = ContactMessage::factory()->read()->create();

    expect($unreadMessage->isRead())->toBeFalse();
    expect($readMessage->isRead())->toBeTrue();
});

test('it scopes unread messages correctly', function () {
    ContactMessage::factory()->count(3)->create(['read_at' => null]);
    ContactMessage::factory()->count(2)->read()->create();

    expect(ContactMessage::unread()->count())->toBe(3);
    expect(ContactMessage::count())->toBe(5);
});
