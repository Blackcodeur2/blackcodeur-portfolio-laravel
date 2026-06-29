<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Enterprise;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Enterprise>
 */
class EnterpriseFactory extends Factory
{
    protected $model = Enterprise::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hasWebsite = $this->faker->boolean(60);
        $name = $this->faker->unique()->company();

        return [
            'category_id' => Category::inRandomOrder()->first()?->id ?? Category::factory(),
            'name' => $name,
            'description' => $this->faker->paragraph(),
            'email_address' => $this->faker->unique()->safeEmail(),
            'google_maps_link' => 'https://maps.google.com/?q=' . urlencode($name),
            'telephone' => $this->faker->unique()->phoneNumber(),
            'website' => $hasWebsite ? $this->faker->url() : null,
            'has_website' => $hasWebsite,
            'address' => $this->faker->address(),
            'rating' => $this->faker->randomFloat(1, 3.0, 5.0),
            'reviews_count' => $this->faker->numberBetween(5, 500),
            'outreach_status' => $this->faker->randomElement(['prospect', 'contacted', 'negotiating', 'signed', 'refused']),
        ];
    }
}
