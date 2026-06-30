<?php

namespace Database\Seeders;

use App\Models\Profile;
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
            'name' => 'Nguefack Azapmo Patrick Evrard',
            'email' => 'nguefackpatrick2004@gmail.com',
            'password' => bcrypt('Nguefack17232@'),
        ]);

        Profile::create([
            'user_id' => $user->id,
            'name' => 'Nguefack Azapmo Patrick Evrard',
            'email' => 'nguefackpatrick2004@gmail.com',
            'telephone' => '+237 6 58 13 51 05',
            'birth_date' => '2004-06-21',
            'sexe' => 'M',
            'profile_picture' => 'profiles/default.jpg',
        ]);

        $this->call(CategorySeeder::class);

        // Generate mock data for the application
        // \App\Models\Enterprise::factory(12)->create();
        // \App\Models\Project::factory(20)->create();
        // \App\Models\Devis::factory(10)->create();
        // \App\Models\ProjectGallery::factory(15)->create();
    }
}
