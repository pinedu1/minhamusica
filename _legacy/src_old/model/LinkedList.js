export class LinkedList {
    #head = null;
    #tail = null;
    #length = 0;

    /**
     * Adiciona um item ao final da lista.
     */
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

    /**
     * Recuperar o item(n) - Retorna os dados do n-ésimo nó.
     * @param {number} n
     * @returns {*}
     */
    get(n) {
        const node = this.#getNodeByIndex(n);
        return node ? node.data : null;
    }

    /**
     * Apagar o item(n) - Remove o nó e reconecta a lista.
     * @param {number} n
     * @returns {boolean}
     */
    remove(n) {
        const target = this.#getNodeByIndex(n);
        if (!target) return false;

        if (target.prev) target.prev.next = target.next;
        else this.#head = target.next; // Era o primeiro

        if (target.next) target.next.prev = target.prev;
        else this.#tail = target.prev; // Era o último

        this.#length--;
        return true;
    }

    /**
     * Alterar o item(n) - Substitui os dados do nó existente.
     * @param {number} n
     * @param {*} data
     * @returns {boolean}
     */
    set(n, data) {
        const node = this.#getNodeByIndex(n);
        if (!node) return false;
        node.data = data;
        return true;
    }

    /**
     * Insere um item em uma posição específica.
     */
    insertAt(n, data) {
        if (n >= this.#length) return this.append(data);
        if (n <= 0) {
            const newNode = { data, next: this.#head, prev: null };
            if (this.#head) this.#head.prev = newNode;
            this.#head = newNode;
            this.#length++;
            return newNode;
        }

        const nextNode = this.#getNodeByIndex(n);
        const newNode = {
            data,
            next: nextNode,
            prev: nextNode.prev
        };

        nextNode.prev.next = newNode;
        nextNode.prev = newNode;
        this.#length++;
        return newNode;
    }

    /**
     * Helper privado para navegar até o nó.
     * Otimizado para buscar do fim se o índice for alto.
     */
    #getNodeByIndex(n) {
        if (n < 0 || n >= this.#length) return null;

        let current;
        // Otimização: Decide se começa do head ou do tail
        if (n < this.#length / 2) {
            current = this.#head;
            for (let i = 0; i < n; i++) current = current.next;
        } else {
            current = this.#tail;
            for (let i = this.#length - 1; i > n; i--) current = current.prev;
        }
        return current;
    }

    // Getters
    get head() { return this.#head; }
    get tail() { return this.#tail; }
    get length() { return this.#length; }

    *[Symbol.iterator]() {
        let current = this.#head;
        while (current) {
            yield current.data;
            current = current.next;
        }
    }
}