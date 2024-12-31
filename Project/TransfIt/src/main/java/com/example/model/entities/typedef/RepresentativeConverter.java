package com.example.model.entities.typedef;

import com.example.model.entities.dental.Representative;
import jakarta.persistence.AttributeConverter;

public class RepresentativeConverter implements AttributeConverter<Representative, String> {

    @Override
    public String convertToDatabaseColumn(Representative representative) {
        if (representative == null) {
            return null;
        }
        return String.format(
                "ROW('%s', '%s', '%s', '%s')",
                representative.getName(),
                representative.getPhone(),
                representative.getEmail(),
                representative.getRelationship()
        );
    }

    @Override
    public Representative convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }

        // Assume PostgreSQL returns composite type as `(name, phone, email, relationship)`
        dbData = dbData.replace("(", "").replace(")", "");
        String[] parts = dbData.split(",");
        Representative representative = new Representative();
        representative.createNewRepresentative(
                parts[0].trim().replace("'", ""),
                parts[1].trim().replace("'", ""),
                parts[2].trim().replace("'", ""),
                parts[3].trim().replace("'", "")
        );
        return representative;
    }
}