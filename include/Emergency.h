
#ifndef EMERGENCY_H
#define EMERGENCY_H

#include <string>
#include <iostream>
using namespace std;

class Emergency {
protected:
    int emergencyId;
    int locationId;
    int severity;
    string status;

public:
    Emergency(int id, int locId, int sev, string stat = "PENDING");
    virtual ~Emergency() {}

    int getEmergencyId() const;
    int getLocationId() const;
    int getSeverity() const;
    string getStatus() const;

    void setSeverity(int sev);
    void setStatus(string stat);

    virtual string getType() const;
    virtual void display() const;
};

struct EmergencyPriorityComparator {
    bool operator()(const Emergency* a, const Emergency* b) const {
        if (a == NULL || b == NULL) return false;
        return a->getSeverity() < b->getSeverity();
    }
};

#endif
