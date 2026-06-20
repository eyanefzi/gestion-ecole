<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;background:#f8fafc;color:#1f2937}
body{display:flex;min-height:100vh}
.kc-brand-panel{width:45%;min-height:100vh;background:linear-gradient(160deg,#1a1f35 0%,#141828 60%,#0d1117 100%);display:flex;align-items:center;justify-content:center;padding:3rem;position:relative;overflow:hidden;flex-shrink:0}
.kc-brand-panel::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 20%,rgba(16,185,129,.15) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(59,130,246,.10) 0%,transparent 50%);pointer-events:none}
.kc-brand-inner{position:relative;z-index:1;text-align:center;max-width:360px}
.kc-brand-icon{font-size:5rem;display:block;margin-bottom:1.5rem;filter:drop-shadow(0 0 30px rgba(16,185,129,.5));animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.kc-brand-title{font-size:2.25rem;font-weight:800;color:#fff;letter-spacing:-.025em;line-height:1.2;margin-bottom:1rem}
.kc-brand-subtitle{font-size:1rem;color:rgba(255,255,255,.6);line-height:1.6;margin-bottom:2rem}
.kc-brand-badges{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center}
.kc-brand-badge{padding:.375rem .875rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:9999px;font-size:.8125rem;font-weight:500;color:rgba(255,255,255,.75)}
.kc-form-panel{flex:1;display:flex;align-items:center;justify-content:center;padding:2rem;background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);min-height:100vh}
.kc-card{width:100%;max-width:440px;background:#fff;border-radius:1.5rem;box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.06);border:1px solid #e5e7eb;overflow:hidden;animation:slideUp .4s ease}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.kc-card-accent{height:4px;background:linear-gradient(90deg,#10b981,#059669)}
.kc-card-header{padding:2rem 2rem 1.5rem;text-align:center;background:linear-gradient(135deg,rgba(249,250,251,.8) 0%,rgba(255,255,255,.4) 100%);border-bottom:1px solid #f3f4f6}
.kc-card-icon{font-size:2.5rem;display:block;margin-bottom:.75rem}
.kc-card-title{font-size:1.5rem;font-weight:700;color:#111827;letter-spacing:-.025em}
.kc-alert{margin:1.25rem 2rem 0;padding:.875rem 1rem;border-radius:.75rem;font-size:.875rem;font-weight:500;display:flex;align-items:flex-start;gap:.625rem;animation:fadeIn .3s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.kc-alert-error{background:#fef2f2;border-left:4px solid #ef4444;color:#b91c1c}
.kc-alert-warning{background:#fffbeb;border-left:4px solid #f59e0b;color:#92400e}
.kc-alert-success{background:#ecfdf5;border-left:4px solid #10b981;color:#047857}
.kc-alert-info{background:#eff6ff;border-left:4px solid #3b82f6;color:#1e40af}
.kc-card-body{padding:2rem}
.kc-form-group{margin-bottom:1.25rem}
.kc-form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
label{display:block;font-size:.875rem;font-weight:600;color:#374151;margin-bottom:.5rem}
input[type="text"],input[type="password"],input[type="email"]{width:100%;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:.75rem;font-size:.9375rem;font-family:inherit;color:#1f2937;background:#fff;transition:border-color 200ms,box-shadow 200ms;outline:none}
input[type="text"]:focus,input[type="password"]:focus,input[type="email"]:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.12)}
input::placeholder{color:#9ca3af}
.kc-password-wrapper{position:relative}
.kc-password-wrapper input{padding-right:3rem}
.kc-pwd-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;color:#9ca3af;display:flex;align-items:center;transition:color 200ms}
.kc-pwd-toggle:hover{color:#10b981}
.kc-field-error{display:block;color:#ef4444;font-size:.8125rem;margin-top:.375rem}
.kc-form-options{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:.5rem}
.kc-checkbox{display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:#6b7280;cursor:pointer}
.kc-checkbox input[type="checkbox"]{width:1rem;height:1rem;accent-color:#10b981;cursor:pointer}
.kc-link{font-size:.875rem;color:#059669;text-decoration:none;font-weight:500;transition:color 200ms}
.kc-link:hover{color:#047857;text-decoration:underline}
.kc-btn-primary{width:100%;padding:.875rem 1.5rem;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:.75rem;font-size:1rem;font-weight:600;font-family:inherit;cursor:pointer;transition:all 200ms;box-shadow:0 8px 20px rgba(16,185,129,.3);letter-spacing:.01em}
.kc-btn-primary:hover{background:linear-gradient(135deg,#059669,#047857);box-shadow:0 12px 25px rgba(16,185,129,.4);transform:translateY(-1px)}
.kc-btn-primary:disabled{opacity:.7;cursor:not-allowed;transform:none}
.kc-social-divider{text-align:center;position:relative;margin:1.5rem 0;color:#9ca3af;font-size:.8125rem;font-weight:500}
.kc-social-divider::before,.kc-social-divider::after{content:'';position:absolute;top:50%;width:40%;height:1px;background:#e5e7eb}
.kc-social-divider::before{left:0}.kc-social-divider::after{right:0}
.kc-social-list{display:flex;flex-direction:column;gap:.75rem}
.kc-social-btn{display:flex;align-items:center;justify-content:center;gap:.75rem;padding:.75rem 1rem;background:#fff;border:1.5px solid #e5e7eb;border-radius:.75rem;font-size:.9375rem;font-weight:500;color:#374151;text-decoration:none;transition:all 200ms}
.kc-social-btn:hover{background:#f9fafb;border-color:#d1d5db;transform:translateY(-1px)}
.kc-card-footer{text-align:center;padding:1.25rem 2rem 2rem;border-top:1px solid #f3f4f6;font-size:.875rem;color:#6b7280}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#f3f4f6;border-radius:9999px}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:9999px}
::selection{background:#10b981;color:#fff}
@media(max-width:768px){.kc-brand-panel{display:none}.kc-form-panel{padding:1.5rem}.kc-card{max-width:100%}.kc-form-row{grid-template-columns:1fr}}
    </style>
</head>
<body>

    <div class="kc-brand-panel">
        <div class="kc-brand-inner">
            <div class="kc-brand-icon">🎓</div>
            <div class="kc-brand-title">Microservices<br>Platform</div>
            <div class="kc-brand-subtitle">Plateforme d'apprentissage en ligne<br>propulsée par Spring Cloud &amp; Angular</div>
            <div class="kc-brand-badges">
                <span class="kc-brand-badge">Angular</span>
                <span class="kc-brand-badge">Spring Boot</span>
                <span class="kc-brand-badge">Node.js</span>
                <span class="kc-brand-badge">PostgreSQL</span>
                <span class="kc-brand-badge">Keycloak</span>
                <span class="kc-brand-badge">RabbitMQ</span>
            </div>
        </div>
    </div>

    <div class="kc-form-panel">
        <div class="kc-card">
            <div class="kc-card-accent"></div>
            <div class="kc-card-header">
                <div class="kc-card-icon">🎓</div>
                <h1 class="kc-card-title"><#nested "header"></h1>
            </div>

            <#if displayMessage && message?has_content>
                <#if message.type != 'warning' || !isAppInitiatedAction??>
                    <div class="kc-alert kc-alert-${message.type}">
                        <#if message.type = 'success'>&#10003;
                        <#elseif message.type = 'error'>&#10007;
                        <#elseif message.type = 'warning'>&#9888;
                        <#else>&#8505;
                        </#if>
                        <span>${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>
            </#if>

            <div class="kc-card-body">
                <#nested "form">
            </div>

            <#if displayInfo>
                <div class="kc-card-footer">
                    <#nested "info">
                </div>
            </#if>
        </div>
    </div>

</body>
</html>
</#macro>
