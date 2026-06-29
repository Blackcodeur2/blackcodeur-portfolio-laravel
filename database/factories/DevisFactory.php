<?php

namespace Database\Factories;

use App\Models\Devis;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Devis>
 */
class DevisFactory extends Factory
{
    protected $model = Devis::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::inRandomOrder()->first()?->id ?? Project::factory(),
            'content' => $this->faker->paragraph(2),
            // We use a mock name representing an estimate file (e.g. devis_1.pdf)
            'document' => 'devis/' . $this->faker->slug() . '.pdf',
        ];
    }
}
