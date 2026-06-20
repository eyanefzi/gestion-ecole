<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm') displayInfo=true; section>
    <#if section = "header">
        ${msg("registerTitle")}
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post">

            <div class="kc-form-row">
                <div class="kc-form-group">
                    <label for="firstName">${msg("firstName")}</label>
                    <input type="text" id="firstName" name="firstName" value="${(register.formData.firstName!'')?html}" placeholder="Prénom"/>
                    <#if messagesPerField.existsError('firstName')>
                        <span class="kc-field-error">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</span>
                    </#if>
                </div>
                <div class="kc-form-group">
                    <label for="lastName">${msg("lastName")}</label>
                    <input type="text" id="lastName" name="lastName" value="${(register.formData.lastName!'')?html}" placeholder="Nom"/>
                    <#if messagesPerField.existsError('lastName')>
                        <span class="kc-field-error">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</span>
                    </#if>
                </div>
            </div>

            <div class="kc-form-group">
                <label for="email">${msg("email")}</label>
                <input type="text" id="email" name="email" value="${(register.formData.email!'')?html}" autocomplete="email" placeholder="votre@email.com"/>
                <#if messagesPerField.existsError('email')>
                    <span class="kc-field-error">${kcSanitize(messagesPerField.get('email'))?no_esc}</span>
                </#if>
            </div>

            <#if !realm.registrationEmailAsUsername>
                <div class="kc-form-group">
                    <label for="username">${msg("username")}</label>
                    <input type="text" id="username" name="username" value="${(register.formData.username!'')?html}" autocomplete="username" placeholder="Nom d'utilisateur"/>
                    <#if messagesPerField.existsError('username')>
                        <span class="kc-field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
                    </#if>
                </div>
            </#if>

            <#if passwordRequired??>
                <div class="kc-form-group">
                    <label for="password">${msg("password")}</label>
                    <input type="password" id="password" name="password" autocomplete="new-password" placeholder="Mot de passe sécurisé"/>
                    <#if messagesPerField.existsError('password')>
                        <span class="kc-field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
                    </#if>
                </div>
                <div class="kc-form-group">
                    <label for="password-confirm">${msg("passwordConfirm")}</label>
                    <input type="password" id="password-confirm" name="password-confirm" placeholder="Confirmer le mot de passe"/>
                    <#if messagesPerField.existsError('password-confirm')>
                        <span class="kc-field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span>
                    </#if>
                </div>
            </#if>

            <button type="submit" class="kc-btn-primary">${msg("doRegister")}</button>
        </form>
    <#elseif section = "info">
        <span>${msg("backToLogin")} <a href="${url.loginUrl}" class="kc-link">${msg("doLogIn")}</a></span>
    </#if>
</@layout.registrationLayout>
