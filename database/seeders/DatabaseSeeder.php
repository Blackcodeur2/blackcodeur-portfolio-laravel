<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        \App\Models\Profile::create([
            'user_id' => $user->id,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'telephone' => '+33 6 12 34 56 78',
            'birth_date' => '1995-05-15',
            'sexe' => 'M',
            'profile_picture' => 'profiles/default.jpg',
        ]);

        $this->call(CategorySeeder::class);

        // Generate mock data for the application
        \App\Models\Enterprise::factory(12)->create();
        \App\Models\Project::factory(20)->create();
        \App\Models\Devis::factory(10)->create();
        \App\Models\ProjectGallery::factory(15)->create();
    }
}
