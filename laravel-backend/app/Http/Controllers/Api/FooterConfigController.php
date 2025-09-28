<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class FooterConfigController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    public function getFooterSettings()
    {
        try {
            // Get footer settings
            $footerSettings = DB::table('admin_settings')
                ->where('setting_key', 'footer_settings')
                ->first();

            return response()->json(
                $footerSettings ? json_decode($footerSettings->setting_value, true) : $this->getDefaultFooterSettings()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du chargement des paramètres du pied de page',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function saveFooterSettings(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:500',
            'copyright_year' => 'required|string|max:4',
            'social_links' => 'required|array',
            'social_links.*.platform' => 'required|string',
            'social_links.*.url' => 'nullable|url',
            'social_links.*.enabled' => 'required|boolean',
        ]);

        try {
            // Save footer settings
            DB::table('admin_settings')->updateOrInsert(
                ['setting_key' => 'footer_settings'],
                [
                    'setting_value' => json_encode($request->all()),
                    'updated_at' => now(),
                    'description' => 'Paramètres du pied de page (contact, réseaux sociaux, légal)'
                ]
            );

            return response()->json([
                'message' => 'Paramètres du pied de page sauvegardés avec succès'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la sauvegarde',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    private function getDefaultFooterSettings()
    {
        return [
            'phone' => '+229 XX XX XX XX',
            'email' => 'contact@exchangepro.com',
            'address' => 'Cotonou, Bénin',
            'copyright_year' => '2025',
            'social_links' => [
                [
                    'platform' => 'facebook',
                    'url' => '',
                    'enabled' => false,
                ],
                [
                    'platform' => 'twitter',
                    'url' => '',
                    'enabled' => false,
                ],
                [
                    'platform' => 'instagram',
                    'url' => '',
                    'enabled' => false,
                ],
                [
                    'platform' => 'linkedin',
                    'url' => '',
                    'enabled' => false,
                ],
                [
                    'platform' => 'youtube',
                    'url' => '',
                    'enabled' => false,
                ],
            ],
        ];
    }
}