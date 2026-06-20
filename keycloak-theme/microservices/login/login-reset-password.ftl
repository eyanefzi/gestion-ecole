<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailForgotTitle")}
    <#elseif section = "form">
        <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
            <div class="kc-form-group">
                <label for="username">
                    <#if !realm.loginWithEmailAllowed>Nom d'utilisateur
                    <#elseif !realm.registrationEmailAsUsername>Nom d'utilisateur ou email
                    <#else>Adresse email
                    </#if>
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    autofocus
                    value="${(auth.attemptedUsername!'')?html}"
                    placeholder="<#if !realm.loginWithEmailAllowed>Nom d'utilisateur<#elseif !realm.registrationEmailAsUsername>Nom d'utilisateur ou email<#else>votre@email.com</#if>"
                />
                <#if messagesPerField.existsError('username')>
                    <span class="kc-field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
                </#if>
            </div>
            <button type="submit" class="kc-btn-primary">${msg("doSubmit")}</button>
        </form>
    <#elseif section = "info">
        <a href="${url.loginUrl}" class="kc-link">← ${msg("backToLogin")}</a>
    </#if>
</@layout.registrationLayout>
