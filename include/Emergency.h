#ifndef EMERGENCY_H
#define EMERGENCY_H

#include <string>
#include <iostream>

class Emergency {
protected:
    int emergencyId;
    int locationId;
    int severity;      // Higher numeric value = higher priority
    std::string status;

public:
    Emergency(int id, int locId, int sev, const std::string& stat = "PENDING");
    virtual ~Emergency() = default;

    int getEmergencyId() const;
    int getLocationId() const;
    int getSeverity() const;
    std::string getStatus() const;

    void setSeverity(int sev);
    void setStatus(const std::string& stat);

    virtual std::string getType() const;
    virtual void display() const;
};

struct EmergencyPriorityComparator {
    bool operator()(const Emergency* a, const Emergency* b) const {
        if (!a || !b) return false;
        return a->getSeverity() < b->getSeverity();
    }
};

#endif // EMERGENCY_H