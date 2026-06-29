<?php

use App\Models\Category;
use App\Models\User;

test('guests are redirected to the login page from category admin endpoints', function () {
    $category = Category::factory()->create();

    $this->get(route('categories.index'))
        ->assertRedirect(route('login'));

    $this->post(route('categories.store'), ['name' => 'New Tech'])
        ->assertRedirect(route('login'));

    $this->put(route('categories.update', $category), ['name' => 'Updated Tech'])
        ->assertRedirect(route('login'));

    $this->delete(route('categories.destroy', $category))
        ->assertRedirect(route('login'));
});

test('authenticated users can view the categories list', function () {
    $user = User::factory()->create();
    Category::factory()->count(3)->create();

    $this->actingAs($user)
        ->get(route('categories.index'))
        ->assertOk();
});

test('authenticated users can create a new category', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('categories.store'), [
            'name' => 'Nouveau Secteur',
            'description' => 'Description du secteur',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', [
        'name' => 'Nouveau Secteur',
        'description' => 'Description du secteur',
    ]);
});

test('category name must be unique', function () {
    $user = User::factory()->create();
    Category::factory()->create(['name' => 'Secteur Unique']);

    $response = $this->actingAs($user)
        ->post(route('categories.store'), [
            'name' => 'Secteur Unique',
        ]);

    $response->assertSessionHasErrors(['name']);
});

test('authenticated users can update a category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['name' => 'Ancien Nom']);

    $response = $this->actingAs($user)
        ->put(route('categories.update', $category), [
            'name' => 'Nom Modifié',
            'description' => 'Description modifiée',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Nom Modifié',
        'description' => 'Description modifiée',
    ]);
});

test('authenticated users can delete a category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user)
        ->delete(route('categories.destroy', $category));

    $response->assertRedirect();
    $this->assertDatabaseMissing('categories', [
        'id' => $category->id,
    ]);
});
