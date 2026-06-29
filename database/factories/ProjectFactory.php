<?php

namespace Database\Factories;

use App\Models\Enterprise;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isFinished = $this->faker->boolean(40);
        $projectName = $this->faker->randomElement([
            'Refonte Site Vitrine',
            'Application Mobile Clients',
            'Optimisation Référencement Google Maps',
            'Système de Réservation En Ligne',
            'Campagne Publicitaire & Social Media',
            'CRM Interne sur Mesure',
            'Mise en place Plateforme E-Commerce'
        ]) . ' ' . $this->faker->city();

        return [
            'enterprise_id' => Enterprise::inRandomOrder()->first()?->id ?? Enterprise::factory(),
            'name' => $projectName,
            'description' => $this->faker->paragraph(),
            'is_finished' => $isFinished,
            'public_link' => $isFinished ? $this->faker->url() : null,
            'github_link' => $this->faker->boolean(70) ? 'https://github.com/blackcodeur/' . str($projectName)->slug() : null,
        ];
    }
}
