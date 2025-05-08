import { Model, DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";

// Definerer 'Website' modellen som en subklasse av Sequelize's 'Model' klasse
export class Website extends Model {
  declare id: string; // Unik identifikator for nettstedet
  declare title: string; // Tittel på nettstedet
  declare description: string; // Beskrivelse av nettstedet
  declare url: string; // Nettadresse til nettstedet
  declare word_count: number; // Antall ord på nettstedet
  declare rank: number; // Rangering av nettstedet

  // Initialiserer modellen med nødvendige felter og konfigurasjoner
  static initializeModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true, // Angir at id er primærnøkkel
        },
        title: DataTypes.STRING(512), // Tittel kan være opp til 512 tegn
        description: DataTypes.TEXT, // Beskrivelse er tekst (uten spesifikk lengdegrense)
        url: {
          type: DataTypes.STRING(2048),
          unique: true, // Unik URL for hvert nettsted
        },
        word_count: DataTypes.INTEGER, // Antall ord på nettstedet
        rank: DataTypes.INTEGER, // Rangering av nettstedet
      },
      {
        sequelize, // Knytter modellen til en Sequelize-instans
        modelName: "website", // Navnet på modellen
        tableName: "websites", // Navnet på tabellen i databasen
        timestamps: false, // Deaktiverer automatisk tidspunktsregistrering
      }
    );
  }
}
