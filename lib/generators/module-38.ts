// @ts-nocheck
/*
 * Module 38: Observer Pattern
 *
 * Implements the Observer pattern for a publish-subscribe mechanism.
 * It allows objects (observers) to be notified of changes in another
 * object (subject). Adheres to SOLID principles by decoupling the subject
 * from its observers.
 */

// --- Subject ---
// The object that is observed and notifies observers of changes
abstract class Subject {
    private observers: Observer[] = [];

    // Attaches an observer to the subject
    attach(observer: Observer): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) {
            this.observers.push(observer);
            console.log(`Observer attached to subject.`);
        } else {
            console.warn(`Observer already attached.`);
        }
    }
    

    // Detaches an observer from the subject
    detach(observer: Observer): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex !== -1) {
            this.observers.splice(observerIndex, 1);
            console.log(`Observer detached from subject.`);
        } else {
            console.warn(`Observer not found for detachment.`);
        }
    }

    // Notify all observers about an event
    protected notify(): void {
        console.log('Notifying observers...');
        this.observers.forEach(observer => observer.update(this));
    }
}

// --- Observer Interface ---
interface Observer {
    update(subject: Subject): void;
}

// --- Concrete Subject ---
// A sample subject that can have its state changed
class ConcreteSubject extends Subject {
    public state: number | null = null;

    // The subject's business logic that might change its state
    public async changeState(newState: number): Promise<void> {
        console.log(`Subject: Updating state to ${newState}`);
        this.state = newState;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async operation
        this.notify(); // Notify observers when state changes
    }
}

// --- Concrete Observers ---

class ConcreteObserverA implements Observer {
    update(subject: Subject): void {
        if (subject instanceof ConcreteSubject && subject.state !== null) {
            console.log(`ConcreteObserverA: Reacted to the event. New state is ${subject.state}`);
        }
    }
}

class ConcreteObserverB implements Observer {
    update(subject: Subject): void {
        if (subject instanceof ConcreteSubject && subject.state !== null) {
            console.log(`ConcreteObserverB: Reacted to the event. New state is ${subject.state}. Performing secondary action.`);
        }
    }
}

// --- Example Usage ---
async function demonstrateObserverPattern() {
    const subject = new ConcreteSubject();

    const observer1 = new ConcreteObserverA();
    const observer2 = new ConcreteObserverB();

    subject.attach(observer1);
    subject.attach(observer2);

    console.log('\n--- Changing subject state (triggering notifications) ---');
    await subject.changeState(10);

    console.log('\n--- Detaching Observer B ---');
    subject.detach(observer2);

    console.log('\n--- Changing subject state again ---');
    await subject.changeState(20); // Only observer1 should react

    console.log('\n--- Detaching Observer A ---');
    subject.detach(observer1);

    console.log('\n--- Changing subject state with no observers ---');
    await subject.changeState(30);  // No one should react
}

demonstrateObserverPattern();
