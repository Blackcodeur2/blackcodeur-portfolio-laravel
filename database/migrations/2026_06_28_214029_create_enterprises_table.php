<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string("name")->unique();
            $table->text("description")->nullable();
        });

        Schema::create('enterprises', function (Blueprint $table) {
            $table->id();
            $table->foreignId("category_id")->constrained('categories', 'id')->cascadeOnDelete();
            $table->string("name")->unique();
            $table->text("description")->nullable();
            $table->string("email_address")->unique();
            $table->string("google_maps_link")->unique();
            $table->string("telephone")->unique();
            $table->string("website")->nullable();
            $table->boolean("has_website")->default(false);
            $table->string("address");
            $table->decimal("rating", 2, 1)->nullable();
            $table->integer("reviews_count")->nullable();
            $table->string("outreach_status")->default('prospect'); // prospect, contacted, negotiating, signed, refused
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enterprises');
    }
};
