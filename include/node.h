#ifndef NODE_H
#define NODE_H
#include <string>
using namespace std;
class Node 
{
 private:
     int id;
     std::string name;
     string type;
     bool active;
public:
     Node(int id, string name, string type, bool active=true);
     int getId() const;
     string getName() const;
     string getType() const;
     bool isActive() const;

     void setActive(bool active);
};
#endif
