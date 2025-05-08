import { Model, DataTypes } from 'sequelize';
import type { Sequelize } from 'sequelize';

// Definerer 'WebsiteKeyword' modellen som en subklasse av Sequelize's 'Model' klasse
export class WebsiteKeyword extends Model {
  declare keyword_id: string;  // Unik identifikator for nøkkelordet
  declare website_id: string;  // Unik identifikator for nettstedet
  declare occurrences: number;  // Antall forekomster av nøkkelordet på nettstedet
  declare position: number;  // Positivt tall som indikerer posisjonen for nøkkelordet på nettstedet

  // Initialiserer modellen med nødvendige felter og konfigurasjoner
  static initializeModel(sequelize: Sequelize) {
    this.init(
      {
        keyword_id: {
          type: DataTypes.UUID,
          primaryKey: true,  // Angir at keyword_id er primærnøkkel
        },
        website_id: {
          type: DataTypes.UUID,
          primaryKey: true,  // Angir at website_id er primærnøkkel
        },
        position: {
          type: DataTypes.INTEGER,
          primaryKey: true,  // Angir at position er primærnøkkel
        },
        occurrences: DataTypes.INTEGER,  // Antall forekomster av nøkkelordet
      },
      {
        sequelize,  // Knytter modellen til en Sequelize-instans
        modelName: 'website_keyword',  // Navnet på modellen
        tableName: 'website_keywords',  // Navnet på tabellen i databasen
        timestamps: false,  // Deaktiverer automatisk tidspunktsregistrering
      }
    );
  }
}
