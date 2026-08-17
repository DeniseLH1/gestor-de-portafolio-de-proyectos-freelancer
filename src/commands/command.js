class Command {
  constructor(name, description) {
    if (new.target === Command) {
      throw new Error('Command es una clase abstracta: no se puede instanciar directamente.');
    }
    this.name = name;
    this.description = description;
  }

  async execute() {
    throw new Error(`${this.constructor.name} debe implementar su propio método execute().`);
  }
}

export default Command;