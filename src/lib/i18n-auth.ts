/**
 * Translations for Login/Register pages and AuthModal.
 */
import type { Lang } from './i18n';

export interface AuthText {
  // Register page
  registerHeading: string;
  registerSubtitle: string;
  companyNamePlaceholder: string;
  icoPlaceholder: string;
  registerCta: string;
  registerSuccess: string;
  registerFailed: string;
  passwordMin: string;
  icoRequired: string;
  // Common
  haveAccount: string;
  haveAccountLogin: string;
  // AuthModal tabs
  tabLogin: string;
  tabRegister: string;
  // AuthModal extras
  modalLoginHeading: string;
  modalLoginSubtitle: string;
  modalRegisterSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  loginAsB2B: string;
  separatorText: string;
  registerInfo: string;
  continueToRegister: string;
  registerLinkArrow: string;
  closeLabel: string;
}

const cs: AuthText = {
  registerHeading: 'B2B Registrace', registerSubtitle: 'Vytvořte si firemní účet',
  companyNamePlaceholder: 'Název firmy', icoPlaceholder: 'IČO (povinné pro B2B přístup)',
  registerCta: 'Registrovat',
  registerSuccess: 'Registrace úspěšná! Zkontrolujte svůj email pro potvrzení.',
  registerFailed: 'Registrace selhala',
  passwordMin: 'Heslo musí mít alespoň 6 znaků',
  icoRequired: 'IČO je povinné pro B2B registraci',
  haveAccount: 'Už máte účet?', haveAccountLogin: 'Už máte účet? Přihlásit se',
  tabLogin: 'Přihlášení', tabRegister: 'Registrace',
  modalLoginHeading: 'Přihlášení',
  modalLoginSubtitle: 'Přihlaste se pro přístup k velkoobchodnímu katalogu',
  modalRegisterSubtitle: 'Vytvořte si B2B účet pro přístup k velkoobchodním cenám',
  emailLabel: 'Email', passwordLabel: 'Heslo',
  loginAsB2B: 'Přihlásit jako B2B partner', separatorText: 'nebo rychlý přístup',
  registerInfo: 'Pro přístup k velkoobchodním cenám se zaregistrujte jako ověřený B2B partner s platným IČO.',
  continueToRegister: 'Pokračovat na registraci',
  registerLinkArrow: 'Registrovat se →', closeLabel: 'Zavřít',
};

const sk: AuthText = {
  registerHeading: 'B2B Registrácia', registerSubtitle: 'Vytvorte si firemný účet',
  companyNamePlaceholder: 'Názov firmy', icoPlaceholder: 'IČO (povinné pre B2B prístup)',
  registerCta: 'Registrovať',
  registerSuccess: 'Registrácia úspešná! Skontrolujte svoj email.',
  registerFailed: 'Registrácia zlyhala',
  passwordMin: 'Heslo musí mať aspoň 6 znakov',
  icoRequired: 'IČO je povinné pre B2B registráciu',
  haveAccount: 'Už máte účet?', haveAccountLogin: 'Už máte účet? Prihlásiť sa',
  tabLogin: 'Prihlásenie', tabRegister: 'Registrácia',
  modalLoginHeading: 'Prihlásenie',
  modalLoginSubtitle: 'Prihláste sa na prístup k veľkoobchodnému katalógu',
  modalRegisterSubtitle: 'Vytvorte si B2B účet pre prístup k veľkoobchodným cenám',
  emailLabel: 'Email', passwordLabel: 'Heslo',
  loginAsB2B: 'Prihlásiť ako B2B partner', separatorText: 'alebo rýchly prístup',
  registerInfo: 'Pre prístup k veľkoobchodným cenám sa zaregistrujte ako overený B2B partner s platným IČO.',
  continueToRegister: 'Pokračovať na registráciu',
  registerLinkArrow: 'Registrovať sa →', closeLabel: 'Zavrieť',
};

const pl: AuthText = {
  registerHeading: 'Rejestracja B2B', registerSubtitle: 'Utwórz konto firmowe',
  companyNamePlaceholder: 'Nazwa firmy', icoPlaceholder: 'NIP (wymagany dla B2B)',
  registerCta: 'Zarejestruj',
  registerSuccess: 'Rejestracja udana! Sprawdź swój email.',
  registerFailed: 'Rejestracja nie powiodła się',
  passwordMin: 'Hasło musi mieć co najmniej 6 znaków',
  icoRequired: 'NIP jest wymagany do rejestracji B2B',
  haveAccount: 'Masz już konto?', haveAccountLogin: 'Masz konto? Zaloguj się',
  tabLogin: 'Logowanie', tabRegister: 'Rejestracja',
  modalLoginHeading: 'Logowanie',
  modalLoginSubtitle: 'Zaloguj się, aby uzyskać dostęp do katalogu hurtowego',
  modalRegisterSubtitle: 'Utwórz konto B2B, aby uzyskać dostęp do cen hurtowych',
  emailLabel: 'Email', passwordLabel: 'Hasło',
  loginAsB2B: 'Zaloguj jako partner B2B', separatorText: 'lub szybki dostęp',
  registerInfo: 'Aby uzyskać dostęp do cen hurtowych, zarejestruj się jako partner B2B z ważnym NIP.',
  continueToRegister: 'Przejdź do rejestracji',
  registerLinkArrow: 'Zarejestruj się →', closeLabel: 'Zamknij',
};

const de: AuthText = {
  registerHeading: 'B2B-Registrierung', registerSubtitle: 'Geschäftskonto erstellen',
  companyNamePlaceholder: 'Firmenname', icoPlaceholder: 'USt-ID (erforderlich für B2B)',
  registerCta: 'Registrieren',
  registerSuccess: 'Registrierung erfolgreich! E-Mail prüfen.',
  registerFailed: 'Registrierung fehlgeschlagen',
  passwordMin: 'Passwort muss mindestens 6 Zeichen haben',
  icoRequired: 'USt-ID ist für B2B-Registrierung erforderlich',
  haveAccount: 'Schon ein Konto?', haveAccountLogin: 'Schon ein Konto? Anmelden',
  tabLogin: 'Anmeldung', tabRegister: 'Registrierung',
  modalLoginHeading: 'Anmeldung',
  modalLoginSubtitle: 'Melden Sie sich für Zugang zum Großhandelskatalog an',
  modalRegisterSubtitle: 'Erstellen Sie ein B2B-Konto für Großhandelspreise',
  emailLabel: 'Email', passwordLabel: 'Passwort',
  loginAsB2B: 'Als B2B-Partner anmelden', separatorText: 'oder schneller Zugang',
  registerInfo: 'Für Zugang zu Großhandelspreisen registrieren Sie sich als verifizierter B2B-Partner mit gültiger USt-ID.',
  continueToRegister: 'Weiter zur Registrierung',
  registerLinkArrow: 'Registrieren →', closeLabel: 'Schließen',
};

const en: AuthText = {
  registerHeading: 'B2B Registration', registerSubtitle: 'Create your business account',
  companyNamePlaceholder: 'Company name', icoPlaceholder: 'VAT ID (required for B2B)',
  registerCta: 'Register',
  registerSuccess: 'Registration successful! Check your email to confirm.',
  registerFailed: 'Registration failed',
  passwordMin: 'Password must be at least 6 characters',
  icoRequired: 'VAT ID is required for B2B registration',
  haveAccount: 'Already have an account?', haveAccountLogin: 'Already have an account? Sign in',
  tabLogin: 'Sign in', tabRegister: 'Register',
  modalLoginHeading: 'Sign in',
  modalLoginSubtitle: 'Sign in to access the wholesale catalog',
  modalRegisterSubtitle: 'Create a B2B account to access wholesale prices',
  emailLabel: 'Email', passwordLabel: 'Password',
  loginAsB2B: 'Sign in as B2B partner', separatorText: 'or quick access',
  registerInfo: 'For access to wholesale prices, register as a verified B2B partner with a valid VAT ID.',
  continueToRegister: 'Continue to registration',
  registerLinkArrow: 'Register →', closeLabel: 'Close',
};

const fr: AuthText = {
  registerHeading: 'Inscription B2B', registerSubtitle: 'Créez votre compte professionnel',
  companyNamePlaceholder: "Nom de l'entreprise", icoPlaceholder: 'N° TVA (requis pour B2B)',
  registerCta: "S'inscrire",
  registerSuccess: 'Inscription réussie ! Vérifiez votre email.',
  registerFailed: "Échec de l'inscription",
  passwordMin: 'Le mot de passe doit contenir au moins 6 caractères',
  icoRequired: 'Le N° TVA est requis pour B2B',
  haveAccount: 'Déjà un compte ?', haveAccountLogin: 'Déjà un compte ? Se connecter',
  tabLogin: 'Connexion', tabRegister: 'Inscription',
  modalLoginHeading: 'Connexion',
  modalLoginSubtitle: 'Connectez-vous pour accéder au catalogue de gros',
  modalRegisterSubtitle: 'Créez un compte B2B pour accéder aux prix de gros',
  emailLabel: 'Email', passwordLabel: 'Mot de passe',
  loginAsB2B: 'Se connecter en tant que partenaire B2B', separatorText: 'ou accès rapide',
  registerInfo: 'Pour accéder aux prix de gros, inscrivez-vous comme partenaire B2B vérifié avec un N° TVA valide.',
  continueToRegister: "Continuer vers l'inscription",
  registerLinkArrow: "S'inscrire →", closeLabel: 'Fermer',
};

const es: AuthText = {
  registerHeading: 'Registro B2B', registerSubtitle: 'Crea tu cuenta de empresa',
  companyNamePlaceholder: 'Nombre de la empresa', icoPlaceholder: 'NIF/CIF (obligatorio para B2B)',
  registerCta: 'Registrarse',
  registerSuccess: '¡Registro completado! Revisa tu email.',
  registerFailed: 'Error en el registro',
  passwordMin: 'La contraseña debe tener al menos 6 caracteres',
  icoRequired: 'El NIF/CIF es obligatorio para B2B',
  haveAccount: '¿Ya tienes cuenta?', haveAccountLogin: '¿Ya tienes cuenta? Inicia sesión',
  tabLogin: 'Acceder', tabRegister: 'Registro',
  modalLoginHeading: 'Acceder',
  modalLoginSubtitle: 'Accede al catálogo mayorista',
  modalRegisterSubtitle: 'Crea una cuenta B2B para acceder a precios mayoristas',
  emailLabel: 'Email', passwordLabel: 'Contraseña',
  loginAsB2B: 'Acceder como socio B2B', separatorText: 'o acceso rápido',
  registerInfo: 'Para acceder a precios mayoristas, regístrate como socio B2B con NIF/CIF válido.',
  continueToRegister: 'Continuar al registro',
  registerLinkArrow: 'Registrarse →', closeLabel: 'Cerrar',
};

const it: AuthText = {
  registerHeading: 'Registrazione B2B', registerSubtitle: 'Crea il tuo account aziendale',
  companyNamePlaceholder: "Nome dell'azienda", icoPlaceholder: 'Partita IVA (obbligatoria per B2B)',
  registerCta: 'Registrati',
  registerSuccess: 'Registrazione riuscita! Controlla la tua email.',
  registerFailed: 'Registrazione fallita',
  passwordMin: 'La password deve avere almeno 6 caratteri',
  icoRequired: 'La Partita IVA è obbligatoria per B2B',
  haveAccount: 'Hai già un account?', haveAccountLogin: 'Hai già un account? Accedi',
  tabLogin: 'Accedi', tabRegister: 'Registrati',
  modalLoginHeading: 'Accedi',
  modalLoginSubtitle: "Accedi per il catalogo all'ingrosso",
  modalRegisterSubtitle: "Crea un account B2B per i prezzi all'ingrosso",
  emailLabel: 'Email', passwordLabel: 'Password',
  loginAsB2B: 'Accedi come partner B2B', separatorText: 'o accesso rapido',
  registerInfo: "Per i prezzi all'ingrosso registrati come partner B2B con Partita IVA valida.",
  continueToRegister: 'Continua alla registrazione',
  registerLinkArrow: 'Registrati →', closeLabel: 'Chiudi',
};

const nl: AuthText = {
  registerHeading: 'B2B-registratie', registerSubtitle: 'Maak uw zakelijke account',
  companyNamePlaceholder: 'Bedrijfsnaam', icoPlaceholder: 'BTW-nummer (vereist voor B2B)',
  registerCta: 'Registreren',
  registerSuccess: 'Registratie succesvol! Controleer uw e-mail.',
  registerFailed: 'Registratie mislukt',
  passwordMin: 'Wachtwoord moet minimaal 6 tekens hebben',
  icoRequired: 'BTW-nummer is vereist voor B2B',
  haveAccount: 'Heeft u al een account?', haveAccountLogin: 'Heeft u een account? Inloggen',
  tabLogin: 'Inloggen', tabRegister: 'Registreren',
  modalLoginHeading: 'Inloggen',
  modalLoginSubtitle: 'Log in voor toegang tot de groothandelscatalogus',
  modalRegisterSubtitle: 'Maak een B2B-account voor groothandelsprijzen',
  emailLabel: 'Email', passwordLabel: 'Wachtwoord',
  loginAsB2B: 'Inloggen als B2B-partner', separatorText: 'of snelle toegang',
  registerInfo: 'Voor toegang tot groothandelsprijzen registreert u zich als geverifieerde B2B-partner met geldig BTW-nummer.',
  continueToRegister: 'Doorgaan naar registratie',
  registerLinkArrow: 'Registreren →', closeLabel: 'Sluiten',
};

const pt: AuthText = {
  registerHeading: 'Registo B2B', registerSubtitle: 'Crie a sua conta empresarial',
  companyNamePlaceholder: 'Nome da empresa', icoPlaceholder: 'NIF (obrigatório para B2B)',
  registerCta: 'Registar',
  registerSuccess: 'Registo concluído! Verifique o seu email.',
  registerFailed: 'Falha no registo',
  passwordMin: 'A palavra-passe deve ter pelo menos 6 caracteres',
  icoRequired: 'O NIF é obrigatório para registo B2B',
  haveAccount: 'Já tem conta?', haveAccountLogin: 'Já tem conta? Entrar',
  tabLogin: 'Entrar', tabRegister: 'Registar',
  modalLoginHeading: 'Entrar',
  modalLoginSubtitle: 'Entre para aceder ao catálogo grossista',
  modalRegisterSubtitle: 'Crie uma conta B2B para preços grossistas',
  emailLabel: 'Email', passwordLabel: 'Palavra-passe',
  loginAsB2B: 'Entrar como parceiro B2B', separatorText: 'ou acesso rápido',
  registerInfo: 'Para preços grossistas, registe-se como parceiro B2B com NIF válido.',
  continueToRegister: 'Continuar para o registo',
  registerLinkArrow: 'Registar →', closeLabel: 'Fechar',
};

const hu: AuthText = {
  registerHeading: 'B2B regisztráció', registerSubtitle: 'Hozza létre céges fiókját',
  companyNamePlaceholder: 'Cégnév', icoPlaceholder: 'Adószám (B2B-hez kötelező)',
  registerCta: 'Regisztráció',
  registerSuccess: 'Sikeres regisztráció! Ellenőrizze emailjét.',
  registerFailed: 'Regisztráció sikertelen',
  passwordMin: 'A jelszónak legalább 6 karakteresnek kell lennie',
  icoRequired: 'B2B regisztrációhoz adószám szükséges',
  haveAccount: 'Van már fiókja?', haveAccountLogin: 'Van fiókja? Bejelentkezés',
  tabLogin: 'Bejelentkezés', tabRegister: 'Regisztráció',
  modalLoginHeading: 'Bejelentkezés',
  modalLoginSubtitle: 'Jelentkezzen be a nagykereskedelmi katalógusba',
  modalRegisterSubtitle: 'Hozzon létre B2B fiókot a nagykereskedelmi árakhoz',
  emailLabel: 'Email', passwordLabel: 'Jelszó',
  loginAsB2B: 'Bejelentkezés B2B partnerként', separatorText: 'vagy gyors hozzáférés',
  registerInfo: 'A nagykereskedelmi árakhoz regisztráljon B2B partnerként érvényes adószámmal.',
  continueToRegister: 'Tovább a regisztrációra',
  registerLinkArrow: 'Regisztráció →', closeLabel: 'Bezárás',
};

const ro: AuthText = {
  registerHeading: 'Înregistrare B2B', registerSubtitle: 'Creați contul de companie',
  companyNamePlaceholder: 'Nume companie', icoPlaceholder: 'CUI (obligatoriu pentru B2B)',
  registerCta: 'Înregistrare',
  registerSuccess: 'Înregistrare reușită! Verificați emailul.',
  registerFailed: 'Înregistrare eșuată',
  passwordMin: 'Parola trebuie să aibă cel puțin 6 caractere',
  icoRequired: 'CUI obligatoriu pentru B2B',
  haveAccount: 'Aveți deja cont?', haveAccountLogin: 'Aveți cont? Conectare',
  tabLogin: 'Conectare', tabRegister: 'Înregistrare',
  modalLoginHeading: 'Conectare',
  modalLoginSubtitle: 'Conectați-vă pentru a accesa catalogul en-gros',
  modalRegisterSubtitle: 'Creați un cont B2B pentru prețurile en-gros',
  emailLabel: 'Email', passwordLabel: 'Parolă',
  loginAsB2B: 'Conectare ca partener B2B', separatorText: 'sau acces rapid',
  registerInfo: 'Pentru prețuri en-gros, înregistrați-vă ca partener B2B cu CUI valid.',
  continueToRegister: 'Continuare la înregistrare',
  registerLinkArrow: 'Înregistrare →', closeLabel: 'Închide',
};

const sv: AuthText = {
  registerHeading: 'B2B-registrering', registerSubtitle: 'Skapa ditt företagskonto',
  companyNamePlaceholder: 'Företagsnamn', icoPlaceholder: 'Org.-nr (krävs för B2B)',
  registerCta: 'Registrera',
  registerSuccess: 'Registrering klar! Kolla din e-post.',
  registerFailed: 'Registrering misslyckades',
  passwordMin: 'Lösenordet måste vara minst 6 tecken',
  icoRequired: 'Org.-nr krävs för B2B',
  haveAccount: 'Har du redan konto?', haveAccountLogin: 'Har du konto? Logga in',
  tabLogin: 'Logga in', tabRegister: 'Registrera',
  modalLoginHeading: 'Logga in',
  modalLoginSubtitle: 'Logga in för att se grossistkatalogen',
  modalRegisterSubtitle: 'Skapa ett B2B-konto för grossistpriser',
  emailLabel: 'E-post', passwordLabel: 'Lösenord',
  loginAsB2B: 'Logga in som B2B-partner', separatorText: 'eller snabb åtkomst',
  registerInfo: 'För grossistpriser, registrera dig som B2B-partner med giltigt org.-nr.',
  continueToRegister: 'Fortsätt till registrering',
  registerLinkArrow: 'Registrera →', closeLabel: 'Stäng',
};

const da: AuthText = {
  registerHeading: 'B2B-tilmelding', registerSubtitle: 'Opret din erhvervskonto',
  companyNamePlaceholder: 'Firmanavn', icoPlaceholder: 'CVR (krævet for B2B)',
  registerCta: 'Tilmeld',
  registerSuccess: 'Tilmelding fuldført! Tjek din e-mail.',
  registerFailed: 'Tilmelding mislykkedes',
  passwordMin: 'Adgangskoden skal være mindst 6 tegn',
  icoRequired: 'CVR kræves til B2B',
  haveAccount: 'Har du allerede konto?', haveAccountLogin: 'Har du konto? Log ind',
  tabLogin: 'Log ind', tabRegister: 'Tilmeld',
  modalLoginHeading: 'Log ind',
  modalLoginSubtitle: 'Log ind for engroskatalog',
  modalRegisterSubtitle: 'Opret en B2B-konto til engrospriser',
  emailLabel: 'Email', passwordLabel: 'Adgangskode',
  loginAsB2B: 'Log ind som B2B-partner', separatorText: 'eller hurtig adgang',
  registerInfo: 'For engrospriser tilmeld dig som B2B-partner med gyldigt CVR.',
  continueToRegister: 'Fortsæt til tilmelding',
  registerLinkArrow: 'Tilmeld →', closeLabel: 'Luk',
};

const fi: AuthText = {
  registerHeading: 'B2B-rekisteröinti', registerSubtitle: 'Luo yritystili',
  companyNamePlaceholder: 'Yrityksen nimi', icoPlaceholder: 'Y-tunnus (vaaditaan B2B-pääsyyn)',
  registerCta: 'Rekisteröidy',
  registerSuccess: 'Rekisteröinti onnistui! Tarkista sähköpostisi.',
  registerFailed: 'Rekisteröinti epäonnistui',
  passwordMin: 'Salasanan oltava vähintään 6 merkkiä',
  icoRequired: 'Y-tunnus vaaditaan B2B-rekisteröintiin',
  haveAccount: 'Onko sinulla jo tili?', haveAccountLogin: 'Onko sinulla tili? Kirjaudu',
  tabLogin: 'Kirjaudu', tabRegister: 'Rekisteröidy',
  modalLoginHeading: 'Kirjaudu',
  modalLoginSubtitle: 'Kirjaudu nähdäksesi tukkuluettelon',
  modalRegisterSubtitle: 'Luo B2B-tili tukkuhintojen näkemiseen',
  emailLabel: 'Sähköposti', passwordLabel: 'Salasana',
  loginAsB2B: 'Kirjaudu B2B-kumppanina', separatorText: 'tai nopea pääsy',
  registerInfo: 'Tukkuhintoihin rekisteröidy B2B-kumppaniksi voimassa olevalla Y-tunnuksella.',
  continueToRegister: 'Jatka rekisteröintiin',
  registerLinkArrow: 'Rekisteröidy →', closeLabel: 'Sulje',
};

const no: AuthText = {
  registerHeading: 'B2B-registrering', registerSubtitle: 'Opprett bedriftskonto',
  companyNamePlaceholder: 'Firmanavn', icoPlaceholder: 'Org.-nr (kreves for B2B)',
  registerCta: 'Registrer',
  registerSuccess: 'Registrering vellykket! Sjekk e-posten din.',
  registerFailed: 'Registrering mislyktes',
  passwordMin: 'Passordet må være minst 6 tegn',
  icoRequired: 'Org.-nr kreves for B2B',
  haveAccount: 'Har du allerede konto?', haveAccountLogin: 'Har du konto? Logg inn',
  tabLogin: 'Logg inn', tabRegister: 'Registrer',
  modalLoginHeading: 'Logg inn',
  modalLoginSubtitle: 'Logg inn for engroskatalog',
  modalRegisterSubtitle: 'Opprett en B2B-konto for engrospriser',
  emailLabel: 'E-post', passwordLabel: 'Passord',
  loginAsB2B: 'Logg inn som B2B-partner', separatorText: 'eller rask tilgang',
  registerInfo: 'For engrospriser, registrer deg som B2B-partner med gyldig org.-nr.',
  continueToRegister: 'Fortsett til registrering',
  registerLinkArrow: 'Registrer →', closeLabel: 'Lukk',
};

const el: AuthText = {
  registerHeading: 'Εγγραφή B2B', registerSubtitle: 'Δημιουργήστε επαγγελματικό λογαριασμό',
  companyNamePlaceholder: 'Όνομα εταιρείας', icoPlaceholder: 'ΑΦΜ (απαιτείται για B2B)',
  registerCta: 'Εγγραφή',
  registerSuccess: 'Επιτυχής εγγραφή! Ελέγξτε το email σας.',
  registerFailed: 'Η εγγραφή απέτυχε',
  passwordMin: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες',
  icoRequired: 'Το ΑΦΜ απαιτείται για B2B',
  haveAccount: 'Έχετε ήδη λογαριασμό;', haveAccountLogin: 'Έχετε λογαριασμό; Σύνδεση',
  tabLogin: 'Σύνδεση', tabRegister: 'Εγγραφή',
  modalLoginHeading: 'Σύνδεση',
  modalLoginSubtitle: 'Συνδεθείτε για πρόσβαση στον κατάλογο χονδρικής',
  modalRegisterSubtitle: 'Δημιουργήστε λογαριασμό B2B για χονδρικές τιμές',
  emailLabel: 'Email', passwordLabel: 'Κωδικός',
  loginAsB2B: 'Σύνδεση ως συνεργάτης B2B', separatorText: 'ή γρήγορη πρόσβαση',
  registerInfo: 'Για χονδρικές τιμές, εγγραφείτε ως συνεργάτης B2B με έγκυρο ΑΦΜ.',
  continueToRegister: 'Συνέχεια στην εγγραφή',
  registerLinkArrow: 'Εγγραφή →', closeLabel: 'Κλείσιμο',
};

const is: AuthText = {
  registerHeading: 'B2B skráning', registerSubtitle: 'Stofnaðu fyrirtækisreikning',
  companyNamePlaceholder: 'Heiti fyrirtækis', icoPlaceholder: 'Kennitala (krafist fyrir B2B)',
  registerCta: 'Skrá',
  registerSuccess: 'Skráning tókst! Athugaðu netfangið þitt.',
  registerFailed: 'Skráning mistókst',
  passwordMin: 'Lykilorð verður að vera að minnsta kosti 6 stafir',
  icoRequired: 'Kennitala er krafist fyrir B2B skráningu',
  haveAccount: 'Ertu þegar með reikning?', haveAccountLogin: 'Ertu með reikning? Skrá inn',
  tabLogin: 'Skrá inn', tabRegister: 'Skrá',
  modalLoginHeading: 'Skrá inn',
  modalLoginSubtitle: 'Skráðu þig inn til að skoða heildsöluskrá',
  modalRegisterSubtitle: 'Stofnaðu B2B reikning fyrir heildsöluverð',
  emailLabel: 'Netfang', passwordLabel: 'Lykilorð',
  loginAsB2B: 'Skrá inn sem B2B samstarfsaðili', separatorText: 'eða skjótur aðgangur',
  registerInfo: 'Fyrir heildsöluverð skráðu þig sem B2B samstarfsaðili með gildri kennitölu.',
  continueToRegister: 'Halda áfram í skráningu',
  registerLinkArrow: 'Skrá →', closeLabel: 'Loka',
};

export const auth: Record<Lang, AuthText> = {
  cs, sk, pl, de, en, fr, es, it, nl, pt, hu, ro, sv, da, fi, no, el, is,
};
