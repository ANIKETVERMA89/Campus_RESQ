
#ifndef SECURITY_EMERGENCY_H
#define SECURITY_EMERGENCY_H

#include "Emergency.h"

class SecurityEmergency : public Emergency {
private:
    string securityThreat;

public:
    SecurityEmergency(int id, int locId, int sev, string threat,
                      string stat = "PENDING");

    string getSecurityThreat() const;
    void setSecurityThreat(string threat);

    string getType() const override;
    void display() const override;
};

#endif
