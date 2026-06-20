<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password'); section>
    <#if section = "header">
        ${msg("loginAccountTitle")}
    <#elseif section = "form">
        <#if realm.password>
            <form id="kc-form-login" action="${url.loginAction}" method="post" onsubmit="kcSubmit()">

                <#if !usernameHidden??>
                    <div class="kc-form-group">
                        <label for="username">
                            <#if !realm.loginWithEmailAllowed>
                                Nom utilisateur
                            <#elseif !realm.registrationEmailAsUsername>
                                Identifiant ou email
                            <#else>
                                Adresse email
                            </#if>
                        </label>
                        <input tabindex="1" id="username" name="username" type="text"
                               value="${login.username!}"
                               autofocus autocomplete="off"
                               placeholder="Votre identifiant" />
                        <#if messagesPerField.existsError('username','password')>
                            <span class="kc-field-error">
                                ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                            </span>
                        </#if>
                    </div>
                </#if>

                <div class="kc-form-group">
                    <label for="password">${msg("password")}</label>
                    <div class="kc-password-wrapper">
                        <input tabindex="2" id="password" name="password" type="password"
                               autocomplete="current-password"
                               placeholder="Votre mot de passe" />
                        <button type="button" class="kc-pwd-toggle" id="pwd-toggle"
                                onclick="kcTogglePwd()"
                                aria-label="Afficher ou masquer le mot de passe">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="kc-form-options">
                    <#if realm.rememberMe && !usernameHidden??>
                        <label class="kc-checkbox">
                            <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"
                                   <#if login.rememberMe??>checked</#if> />
                            <span>${msg("rememberMe")}</span>
                        </label>
                    </#if>
                    <#if realm.resetPasswordAllowed>
                        <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="kc-link">
                            ${msg("doForgotPassword")}
                        </a>
                    </#if>
                </div>

                <input type="hidden" name="credentialId"
                       <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if> />

                <button tabindex="4" id="kc-login" type="submit" class="kc-btn-primary">
                    ${msg("doLogIn")}
                </button>

            </form>

            <#if social?? && social.providers?has_content>
                <div class="kc-social-divider"><span>Ou continuer avec</span></div>
                <div class="kc-social-list">
                    <#list social.providers as p>
                        <a href="${p.loginUrl}" class="kc-social-btn" rel="nofollow">
                            <#if p.iconClasses?has_content>
                                <i class="${p.iconClasses!}" aria-hidden="true"></i>
                            </#if>
                            <span>${p.displayName!}</span>
                        </a>
                    </#list>
                </div>
            </#if>

            <script>
                function kcSubmit() {
                    var b = document.getElementById("kc-login");
                    b.disabled = true;
                    b.textContent = "Connexion...";
                    return true;
                }
                function kcTogglePwd() {
                    var p = document.getElementById("password");
                    var btn = document.getElementById("pwd-toggle");
                    if (p.type === "password") {
                        p.type = "text";
                        btn.style.color = "#10b981";
                    } else {
                        p.type = "password";
                        btn.style.color = "#9ca3af";
                    }
                }
            </script>
        </#if>

    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed>
            <#if !registrationDisabled??>
                <span>${msg("noAccount")}
                    <a tabindex="6" href="${url.registrationUrl}" class="kc-link">${msg("doRegister")}</a>
                </span>
            </#if>
        </#if>
    </#if>
</@layout.registrationLayout>
