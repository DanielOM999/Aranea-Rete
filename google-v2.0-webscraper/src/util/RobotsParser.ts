// Funksjon som sjekker om root er forbudt for alle user-agents i robots.txt
export default function isRootForbidden(robots: string) {
  const robotsLines = robots.split("\n"); // Deler inn robots.txt innholdet linje for linje

  let isForbidden = false; // Flag for å indikere om root er forbudt
  let userAgentAll = false; // Flag for å sjekke om 'User-Agent: *' er definert

  // Itererer gjennom alle linjene i robots.txt
  for (let i = 0; i < robotsLines.length; i++) {
    const lineText = robotsLines[i].trim().toLowerCase(); // Fjerner unødvendige mellomrom og gjør teksten små bokstaver
    if (lineText.length == 0) continue; // Hopper over tomme linjer

    let [key, value] = lineText.trim().replace(/\s+/g, " ").split(":"); // Deler linjen i nøkkel og verdi basert på kolon
    if (!key || !value) continue; // Hopper over linjer som ikke har en gyldig nøkkel/verdi

    key = key.trim(); // Fjerner ekstra mellomrom rundt nøkkel
    value = value.trim(); // Fjerner ekstra mellomrom rundt verdi

    // Hvis linjen definerer 'User-Agent: *', settes userAgentAll til true
    if (key == "user-agent" && value == "*") {
      userAgentAll = true;
      continue;
    }

    // Hvis 'User-Agent: *' er definert, sjekk om root ('/') er forbudt for denne user-agenten
    if (!userAgentAll) continue; // Hvis 'User-Agent: *' ikke er definert, ignorerer vi resten
    if (key == "disallow" && value == "/") {
      // Hvis root (/) er forbudt for denne user-agenten
      isForbidden = true; // Setter flagget isForbidden til true
      break; // Stopper videre sjekking da vi allerede har funnet en 'disallow' for root
    }
  }

  return isForbidden; // Returnerer true hvis root er forbudt, ellers false
}
