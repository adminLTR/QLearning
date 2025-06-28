class TrafficLight
{
private:
    int red;
    int yellow;
    int green;
public:
    TrafficLight(int red, int yellow, int green) : red(red), yellow(yellow), green(green) {}
    ~TrafficLight() {}

    void begin() {
        pinMode(this->red, OUTPUT);
        pinMode(this->yellow, OUTPUT);
        pinMode(this->green, OUTPUT);
        this->turnOff();
    }

    void turnRed() {
        digitalWrite(red, HIGH);
        digitalWrite(yellow, LOW);
        digitalWrite(green, LOW);
    }

    void turnYellow() {
        digitalWrite(red, LOW);
        digitalWrite(yellow, HIGH);
        digitalWrite(green, LOW);
    }

    void turnGreen() {
        digitalWrite(red, LOW);
        digitalWrite(yellow, LOW);
        digitalWrite(green, HIGH);
    }
    
    void turnOff() {
        digitalWrite(red, LOW);
        digitalWrite(yellow, LOW);
        digitalWrite(green, LOW);
    }
};