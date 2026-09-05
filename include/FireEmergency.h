#ifndef FIRE_EMERGENCY_H
#define FIRE_EMERGENCY_H

#include "Emergency.h"

class FireEmergency : public Emergency {
private:
    double fireRisk;

public:
    FireEmergency(int id, int locId, int sev, double risk, const std::string& stat = "PENDING");
    virtual ~FireEmergency() = default;

    double getFireRisk() const;
    void setFireRisk(double risk);

    std::string getType() const override;
    void display() const override;
};

#endif // FIRE_EMERGENCY_H