<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Restaurants & Cafés',
                'description' => 'Établissements de restauration et débits de boisson.',
            ],
            [
                'name' => 'Boutiques & Commerce',
                'description' => 'Commerces de détail et boutiques physiques.',
            ],
            [
                'name' => 'Agences Tech & Digitales',
                'description' => 'Prestataires de services technologiques, de développement et de marketing.',
            ],
            [
                'name' => 'Bâtiment & Travaux',
                'description' => 'Entrepreneurs en construction, rénovation et travaux de bâtiment.',
            ],
            [
                'name' => 'Services Professionnels',
                'description' => 'Cabinets de conseil, agences immobilières et services divers aux professionnels.',
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
