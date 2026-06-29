<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;

trait UserProfileValidationRule
{
    protected function userProfileRules(?int $userId = null): array
    {
        return [
            'user_id' => $this->userIdRule(),
            'name' => $this->nameRules(),
            'email' => $this->emailRules(),
            /*'telephone' => ['required'],
            'birth_date' => ['required'],
            'sexe' => ['required','in:M,F'],*/
        ];
    }

    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    protected function userIdRule(): array{
        return ['required', 'unique:users,id'];
    }

    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}
