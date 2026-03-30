export class LinkedList {
    #head = null;
    #tail = null;
    #length = 0;

    append(data) {
        const newNode = {
            data: data,
            next: null,
            prev: this.#tail
        };

        if (!this.#head) {
            this.#head = newNode;
            this.#tail = newNode;
        } else {
            this.#tail.next = newNode;
            this.#tail = newNode;
        }

        this.#length++;
        return newNode;
    }

    get head() { return this.#head; }
    get tail() { return this.#tail; }
    get length() { return this.#length; }

    // Permite usar: for (const nota of doc.notes)
    *[Symbol.iterator]() {
        let current = this.#head;
        while (current) {
            yield current.data;
            current = current.next;
        }
    }
}