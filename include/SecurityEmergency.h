#ifndef SECURITY_EMERGENCY_H
#define SECURITY_EMERGENCY_H

#include "Emergency.h"

class SecurityEmergency : public Emergency {
private:
    std::string securityThreat;

public:
    SecurityEmergency(int id, int locId, int sev, const std::string& threat, const std::string& stat = "PENDING");
    virtual ~SecurityEmergency() = default;

    std::string getSecurityThreat() const;
    void setSecurityThreat(const std::string& threat);

    std::string getType() const override;
    void display() const override;
};

#endif // SECURITY_EMERGENCY_H