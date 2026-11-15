
#ifndef MEDICAL_EMERGENCY_H
#define MEDICAL_EMERGENCY_H

#include "Emergency.h"

class MedicalEmergency : public Emergency {
private:
    bool ambulanceRequired;

public:
    MedicalEmergency(int id, int locId, int sev, bool ambReq,
                     string stat = "PENDING");

    bool isAmbulanceRequired() const;
    void setAmbulanceRequired(bool ambReq);

    string getType() const override;
    void display() const override;
};

#endif
