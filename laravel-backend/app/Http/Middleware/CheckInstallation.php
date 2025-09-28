<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckInstallation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $isInstalled = file_exists(base_path('.installed'));
        $isInstallRoute = str_starts_with($request->path(), 'install') || 
                         str_starts_with($request->path(), 'api/install');

        // If not installed and not accessing install routes, redirect to install
        if (!$isInstalled && !$isInstallRoute) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Application not installed',
                    'redirect' => '/install'
                ], 503);
            }
            
            return redirect('/install');
        }

        // If installed and trying to access install routes, redirect to home
        if ($isInstalled && $isInstallRoute) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Application already installed',
                    'redirect' => '/'
                ], 400);
            }
            
            return redirect('/');
        }

        return $next($request);
    }
}