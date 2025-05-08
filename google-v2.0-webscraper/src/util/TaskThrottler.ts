// TaskThrottler: En klasse som håndterer begrensning av samtidige oppgaver (tasks)
export default class TaskThrottler {
  private maxConcurrentSessions: number; // Maksimalt antall samtidige oppgaver
  private throttleInterval: number; // Tidsintervall mellom hver oppgave for å unngå for mange samtidige
  private activeSessions: number = 0; // Antall aktive oppgaver for øyeblikket

  // Konstruktør for å sette maksimal samtidighet og intervall
  constructor(maxConcurrentSessions: number, throttleInterval: number) {
    this.maxConcurrentSessions = maxConcurrentSessions;
    this.throttleInterval = throttleInterval;
  }

  // Øk antall aktive oppgaver med én
  public acquire() {
    this.activeSessions++;
  }

  // Reduser antall aktive oppgaver med én (når oppgaven er ferdig)
  async release() {
    this.activeSessions--;
  }

  // Håndterer "throttling" (begrensning) av oppgaver. Venter hvis det er for mange samtidige oppgaver.
  public async throttle() {
    return new Promise(async (resolve) => {
      // Hvis antall aktive oppgaver er større eller lik maksimal samtidighet, vent i en intervall
      while (this.activeSessions >= this.maxConcurrentSessions) {
        await new Promise(
          (intervalResolve) =>
            setTimeout(intervalResolve, this.throttleInterval) // Vent i en definert tid før neste forsøk
        );
      }

      resolve(undefined); // Når det er plass til å kjøre en ny oppgave, fortsett
    });
  }
}
