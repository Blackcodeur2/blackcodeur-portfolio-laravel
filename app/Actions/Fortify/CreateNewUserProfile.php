<?php

namespace App\Actions\Fortify;

use App\Concerns\UserProfileValidationRule;
use App\Models\Profile;
use Illuminate\Support\Facades\Validator;

class CreateNewUserProfile
{
    use UserProfileValidationRule;

    public function create(array $data) {
        Validator::make($data, [
            ...$this->userProfileRules(),
        ])->validate();

        return Profile::create([
            'user_id' => $data['user_id'],
            'name' => $data['name'],
            'email' => $data['email']
        ]);
    }

}
