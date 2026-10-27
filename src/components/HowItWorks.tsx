import { ChevronIcon } from './Icons';

export function HowItWorks() {
  return (
    <details className="how">
      <summary>
        <ChevronIcon />
        Como funciona
      </summary>
      <div className="how-body">
        <p>
          Cada letra avança um número fixo de posições no alfabeto. Com deslocamento 3, A vira D, B vira E e assim
          por diante. Ao chegar ao fim, a contagem volta ao início: X vira A, Y vira B e Z vira C.
        </p>
        <p>
          Para descriptografar, basta andar o mesmo número de posições no sentido contrário. Maiúsculas e minúsculas
          são mantidas; espaços, números, pontuação, emojis e letras acentuadas como “á” e “ç” passam sem mudança.
        </p>
        <p>
          Como só existem 25 deslocamentos úteis, qualquer pessoa consegue testar todos em segundos. Por isso a cifra
          serve para aprender, não para proteger segredos.
        </p>
      </div>
    </details>
  );
}
