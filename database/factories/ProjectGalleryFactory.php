<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ProjectGallery;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectGallery>
 */
class ProjectGalleryFactory extends Factory
{
    protected $model = ProjectGallery::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::inRandomOrder()->first()?->id ?? Project::factory(),
            'description' => $this->faker->sentence(),
            // Mock image URL or path in gallery/
            'image_item' => 'gallery/' . $this->faker->numberBetween(1, 5) . '.jpg',
        ];
    }
}
