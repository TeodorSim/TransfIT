package com.example.model.entities.typedef;

public class Representitve {
    private String name;
    private String phone;
    private String email;
    private String relationship;

    public Representitve() {}

    protected Representitve(String name, String phone, String email, String relationship) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.relationship = relationship;
    }

    public String getName() {
        return name;
    }
    public String getPhone() {
        return phone;
    }
    public String getEmail() {
        return email;
    }
    public String getRelationship() {
        return relationship;
    }
}
