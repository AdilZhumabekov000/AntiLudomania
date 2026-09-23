import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type Stage =
  | 'start'
  | 'game'
  | 'globalFacts'
  | 'kazakhstan'
  | 'calculator'
  | 'results'
  | 'choice'
  | 'reduce'
  | 'continuePlaying'
  | 'stop'
  | 'final'

type Period = 'day' | 'week' | 'month'

type RoundConfig = {
  cups: number
  win: boolean
}

const rounds: RoundConfig[] = [
  { cups: 5, win: true },
  { cups: 3, win: true },
  { cups: 2, win: false },
]

const globalFacts = [
  {
    number: '≈ 1,9 млрд $',
    title: 'в день',
    text:
      'Таков приблизительный дневной эквивалент прогноза глобальных потерь игроков / доходов игорной индустрии около 700 млрд долларов в год к 2028 году.',
  },
  {
    number: '≈ 80 млн',
    title: 'взрослых',
    text:
      'По глобальным оценкам, десятки миллионов взрослых сталкиваются с проблемным азартным поведением или расстройством, связанным с азартными играми.',
  },
  {
    number: '≈ 60 %',
    title: 'проигрышей',
    text:
      'Значительная доля потерь игроков приходится на людей, которые уже играют на вредном для себя уровне.',
  },
]

const kazakhstanFacts = [
  {
    number: '198 214',
    title:
      'человек воспользовались услугой самоограничения от азартных игр.',
  },
  {
    number: 'F63.0',
    title:
      'Патологическое влечение к азартным играм рассматривается как расстройство и имеет клинический протокол диагностики и лечения.',
  },
  {
    number: '3,5 %',
    title:
      'участников республиканского исследования сообщали о регулярных ставках на онлайн-платформах лицензированных букмекерских контор.',
  },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getSpendingMessage(yearly: number) {
  if (yearly === 0) {
    return {
      range: '0 ₸ в год',
      heading: 'Отличный результат',
      text:
        'По указанным вами данным ваши расходы на азартные игры сейчас составляют 0 ₸.',
    }
  }

  if (yearly < 100_000) {
    return {
      range: 'До 100 000 ₸ в год',
      heading: 'Небольшие суммы тоже накапливаются',
      text:
        'Регулярные небольшие расходы со временем превращаются в более заметную сумму.',
    }
  }

  if (yearly < 500_000) {
    return {
      range: '100 000–500 000 ₸ в год',
      heading: 'Это уже заметные расходы',
      text:
        'Если такой уровень расходов сохраняется несколько лет, общая сумма может стать очень значительной.',
    }
  }

  if (yearly < 1_000_000) {
    return {
      range: '500 000–1 000 000 ₸ в год',
      heading: 'Почти миллион',
      text:
        'Ваш рассчитанный уровень расходов приближается к одному миллиону тенге ежегодно.',
    }
  }

  if (yearly < 2_500_000) {
    return {
      range: '1–2,5 млн ₸ в год',
      heading: 'Миллионы за несколько лет',
      text:
        'При сохранении такого уровня расходов несколько лет общая сумма быстро становится сопоставимой с главным призом.',
    }
  }

  if (yearly < 5_000_000) {
    return {
      range: '2,5–5 млн ₸ в год',
      heading: 'Почти главный приз',
      text:
        'Ваш годовой расчёт уже приближается к 5 000 000 ₸.',
    }
  }

  return {
    range: '5+ млн ₸ в год',
    heading: 'Больше главного приза',
    text:
      'Ваш рассчитанный годовой расход равен или превышает 5 000 000 ₸ — сумму главного приза из начала.',
  }
}

// ======================================================
// CAMERA
// ======================================================

function CameraRig({
  stage,
  globalFactIndex,
}: {
  stage: Stage
  globalFactIndex: number
}) {
  const { camera, pointer, size } = useThree()

  const isMobile = size.width <= 768

  const targetLook = useRef(
    new THREE.Vector3(0, 0.8, 0)
  )

  useFrame(() => {
    let baseX = 0

    if (stage === 'globalFacts') {
      baseX = 3.2 + globalFactIndex * 3.2
    }

    if (stage === 'kazakhstan') {
      baseX = 12.5
    }

    if (
      stage === 'calculator' ||
      stage === 'results' ||
      stage === 'choice' ||
      stage === 'reduce' ||
      stage === 'continuePlaying' ||
      stage === 'stop' ||
      stage === 'final'
    ) {
      baseX = 16
    }

    const isGame = stage === 'game'

    const targetX = isGame
      ? isMobile
        ? 0
        : pointer.x * 0.3
      : baseX + pointer.x * 0.05

    const targetY = isGame
      ? isMobile
        ? 3.5
        : 3.5 + pointer.y * 0.15
      : 3.4 + pointer.y * 0.04

    const targetZ =
      isGame && isMobile
        ? 13.0
        : 7.5

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      targetX,
      0.02
    )

    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      0.025
    )

    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      targetZ,
      0.025
    )

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov =
        isGame && isMobile
          ? 70
          : 42

      camera.fov = THREE.MathUtils.lerp(
        camera.fov,
        targetFov,
        0.08
      )

      camera.updateProjectionMatrix()
    }

    targetLook.current.x = THREE.MathUtils.lerp(
      targetLook.current.x,
      isGame ? 0 : baseX,
      0.02
    )

    targetLook.current.y = THREE.MathUtils.lerp(
      targetLook.current.y,
      0.8,
      0.025
    )

    camera.lookAt(targetLook.current)
  })

  return null
}

// ======================================================
// CUP
// ======================================================

type CupProps = {
  id: number
  x: number
  selected: boolean
  revealAll: boolean
  canChoose: boolean
  onSelect: (id: number) => void
}

function Cup({
  id,
  x,
  selected,
  revealAll,
  canChoose,
  onSelect,
}: CupProps) {
  const cupRef = useRef<THREE.Group>(null)

  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!cupRef.current) return

    const time = state.clock.elapsedTime

    const lifted =
      selected || revealAll

    const idle =
      !lifted
        ? Math.sin(time * 1.3 + id * 0.8) * 0.015
        : 0

    const targetY =
      lifted
        ? 2.2
        : 0.75 + idle

    cupRef.current.position.y =
      THREE.MathUtils.lerp(
        cupRef.current.position.y,
        targetY,
        0.08
      )

    const targetRotation =
      !lifted
        ? Math.sin(time * 1.1 + id) * 0.005
        : 0

    cupRef.current.rotation.z =
      THREE.MathUtils.lerp(
        cupRef.current.rotation.z,
        targetRotation,
        0.05
      )

    const targetScale =
      hovered && canChoose
        ? 1.025
        : 1

    const scale =
      THREE.MathUtils.lerp(
        cupRef.current.scale.x,
        targetScale,
        0.08
      )

    cupRef.current.scale.setScalar(scale)
  })

  return (
    <group
      ref={cupRef}
      position={[x, 0.75, 0]}
      onClick={(event) => {
        event.stopPropagation()

        if (canChoose) {
          onSelect(id)
        }
      }}
      onPointerOver={() => {
        if (!canChoose) return

        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <mesh
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            0.46,
            0.72,
            1.5,
            64,
            1,
            true,
          ]}
        />

        <meshPhysicalMaterial
          color={
            hovered && canChoose
              ? '#c3c7ca'
              : '#a6aaad'
          }
          roughness={0.33}
          metalness={0.2}
          clearcoat={0.13}
          clearcoatRoughness={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[0, 0.75, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <circleGeometry
          args={[0.46, 64]}
        />

        <meshPhysicalMaterial
          color={
            hovered && canChoose
              ? '#d4d7d9'
              : '#b9bdc0'
          }
          roughness={0.3}
          metalness={0.15}
          clearcoat={0.1}
          clearcoatRoughness={0.35}
        />
      </mesh>

      <mesh
        position={[0, -0.745, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[
            0.71,
            0.008,
            10,
            64,
          ]}
        />

        <meshStandardMaterial
          color="#898e92"
          roughness={0.38}
          metalness={0.23}
        />
      </mesh>
    </group>
  )
}

// ======================================================
// PRIZE
// ======================================================

function Prize({
  x,
}: {
  x: number
}) {
  const coinRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!coinRef.current) return

    coinRef.current.rotation.y =
      state.clock.elapsedTime * 0.7
  })

  return (
    <group
      ref={coinRef}
      position={[x, 0.08, 0]}
    >
      <mesh
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            0.3,
            0.3,
            0.09,
            64,
          ]}
        />

        <meshPhysicalMaterial
          color="#d6a62f"
          metalness={0.95}
          roughness={0.16}
          clearcoat={0.55}
          clearcoatRoughness={0.12}
        />
      </mesh>

      <mesh
        position={[0, 0.047, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            0.2,
            0.26,
            64,
          ]}
        />

        <meshStandardMaterial
          color="#ffe18b"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      <mesh
        position={[0, 0.049, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry
          args={[0.13, 64]}
        />

        <meshStandardMaterial
          color="#c89421"
          metalness={0.95}
          roughness={0.18}
        />
      </mesh>

      <pointLight
        position={[0, 0.4, 0]}
        color="#ffd55a"
        intensity={2.2}
        distance={2}
      />
    </group>
  )
}

// ======================================================
// SCENE
// ======================================================

type SceneProps = {
  stage: Stage
  globalFactIndex: number
  cupCount: number
  selectedCup: number | null
  revealAll: boolean
  canChoose: boolean
  winningRound: boolean
  onSelect: (id: number) => void
}

function Scene({
  stage,
  globalFactIndex,
  cupCount,
  selectedCup,
  revealAll,
  canChoose,
  winningRound,
  onSelect,
}: SceneProps) {

  const spacing =
    cupCount === 5
      ? 1.45
      : cupCount === 3
        ? 1.8
        : 2.2

  const positions = Array.from(
    { length: cupCount },
    (_, index) =>
      (index -
        (cupCount - 1) / 2) *
      spacing
  )

  const prizeX =
    selectedCup !== null
      ? positions[selectedCup]
      : 0

  return (
    <>
      <CameraRig
        stage={stage}
        globalFactIndex={globalFactIndex}
      />

      <ambientLight intensity={0.65} />

      <directionalLight
        position={[4, 7, 5]}
        intensity={2.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      />

      <directionalLight
        position={[-4, 4, 2]}
        intensity={0.75}
        color="#d8dee5"
      />

      <pointLight
        position={[0, 4, 4]}
        intensity={1.2}
        distance={12}
        color="#ffffff"
      />

      {/* ВАЖНО:
          стаканы существуют только во время игры */}

      {stage === 'game' && (
        <>
          {positions.map((x, id) => (
            <Cup
              key={id}
              id={id}
              x={x}
              selected={
                selectedCup === id
              }
              revealAll={revealAll}
              canChoose={canChoose}
              onSelect={onSelect}
            />
          ))}

          {selectedCup !== null &&
            winningRound && (
              <Prize x={prizeX} />
            )}
        </>
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry
          args={[60, 20]}
        />

        <meshPhysicalMaterial
          color="#262829"
          roughness={0.88}
          metalness={0}
          clearcoat={0.02}
          clearcoatRoughness={1}
        />
      </mesh>
    </>
  )
}

// ======================================================
// APP
// ======================================================

function App() {
  const [stage, setStage] =
    useState<Stage>('start')

  const [
    roundIndex,
    setRoundIndex,
  ] = useState(0)

  const [
    countdown,
    setCountdown,
  ] = useState(5)

  const [
    selectedCup,
    setSelectedCup,
  ] =
    useState<number | null>(
      null
    )

  const [
    revealAll,
    setRevealAll,
  ] =
    useState(false)

  const [
    showResult,
    setShowResult,
  ] =
    useState(false)

  const [
    globalFactIndex,
    setGlobalFactIndex,
  ] =
    useState(0)

  const [
    amount,
    setAmount,
  ] =
    useState('')

  const [
    period,
    setPeriod,
  ] =
    useState<Period>('week')

  const round =
    rounds[roundIndex]

  // ======================================================
  // TIMER
  // ======================================================

  useEffect(() => {
    if (stage !== 'game') return
    if (selectedCup !== null) return

    setCountdown(5)

    const interval =
      setInterval(() => {
        setCountdown(
          (oldValue) => {
            if (oldValue <= 1) {
              clearInterval(interval)
              return 0
            }

            return oldValue - 1
          }
        )
      }, 1000)

    return () =>
      clearInterval(interval)
  }, [
    stage,
    roundIndex,
    selectedCup,
  ])

  // ======================================================
  // CHOOSE CUP
  // ======================================================

  async function chooseCup(
    id: number
  ) {
    if (
      countdown > 0 ||
      selectedCup !== null ||
      stage !== 'game'
    ) {
      return
    }

    setSelectedCup(id)

    await sleep(1200)

    if (round.win) {
      setShowResult(true)
      return
    }

    await sleep(650)

    setRevealAll(true)

    await sleep(1200)

    setShowResult(true)
  }

  function nextRound() {
    const next =
      roundIndex + 1

    if (
      next >= rounds.length
    ) {
      return
    }

    setRoundIndex(next)

    setSelectedCup(null)
    setRevealAll(false)
    setShowResult(false)
    setCountdown(5)

    document.body.style.cursor =
      'default'
  }

  function continueAfterGame() {
    setShowResult(false)

    setGlobalFactIndex(0)

    setStage(
      'globalFacts'
    )

    document.body.style.cursor =
      'default'
  }

  function nextGlobalFact() {
    if (
      globalFactIndex <
      globalFacts.length - 1
    ) {
      setGlobalFactIndex(
        (current) =>
          current + 1
      )

      return
    }

    setStage(
      'kazakhstan'
    )
  }

  // ======================================================
  // CALCULATOR
  // ======================================================

  const numericAmount =
    Number(amount) || 0

  let yearly = 0

  if (period === 'day') {
    yearly =
      numericAmount * 365
  }

  if (period === 'week') {
    yearly =
      numericAmount * 52
  }

  if (period === 'month') {
    yearly =
      numericAmount * 12
  }

  const daily =
    yearly / 365

  const weekly =
    yearly / 52

  const monthly =
    yearly / 12

  const fiveYears =
    yearly * 5

  const tenYears =
    yearly * 10

  const spendingMessage =
    getSpendingMessage(yearly)

  const formatter =
    new Intl.NumberFormat(
      'ru-RU',
      {
        maximumFractionDigits: 0,
      }
    )

  function money(
    value: number
  ) {
    return (
      formatter.format(
        Math.round(value)
      ) + ' ₸'
    )
  }

  const validAmount =
    amount.trim() !== '' &&
    Number.isFinite(
      Number(amount)
    ) &&
    Number(amount) >= 0

  function calculate() {
    if (!validAmount) return

    setStage(
      'results'
    )
  }

  const enteredPeriod =
    period === 'day'
      ? 'в день'
      : period === 'week'
        ? 'в неделю'
        : 'в месяц'

  // ======================================================
  // START
  // ======================================================

  if (stage === 'start') {
    return (
      <div className="start-screen">

        <div className="start-content">

          <div className="eyebrow">
            ПРОВЕРЬ СВОЮ УДАЧУ
          </div>

          <div className="start-prize">

            <span>
              ГЛАВНЫЙ ПРИЗ
            </span>

            <strong>
              5 000 000 ₸
            </strong>

          </div>

          <h1>
            Выбери стакан
          </h1>

          <p>
            Три раунда.
            <br />
            Сделай свой выбор.
            <br />
            Сможешь дойти
            до конца?
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setStage('game')
            }
          >
            Начать
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="app">

      <style>{`
        @media (max-width: 768px) {
          .result-card {
            transform: translateY(-32px);
          }
        }
      `}</style>

      <Canvas
        shadows
        camera={{
          position: [
            0,
            3.5,
            7.5,
          ],
          fov: 42,
        }}
      >
        <Scene
          stage={stage}
          globalFactIndex={
            globalFactIndex
          }
          cupCount={
            round.cups
          }
          selectedCup={
            selectedCup
          }
          revealAll={
            revealAll
          }
          canChoose={
            stage === 'game' &&
            countdown === 0 &&
            selectedCup === null
          }
          winningRound={
            round.win
          }
          onSelect={
            chooseCup
          }
        />
      </Canvas>

      {/* GAME */}

      {stage === 'game' && (
        <>
          <div className="game-header">

            <div className="round-label">
              РАУНД{' '}
              {roundIndex + 1}{' '}
              / 3
            </div>

            <div className="game-prize">
              5 000 000 ₸
            </div>

            {selectedCup === null &&
              countdown > 0 && (
                <>
                  <div className="think-label">
                    Время подумать
                  </div>

                  <div className="timer">
                    {countdown}
                  </div>
                </>
              )}

            {countdown === 0 &&
              selectedCup === null && (
                <div className="choose-title">
                  Выберите стакан
                </div>
              )}

          </div>

          {showResult && (
            <div className="result-wrapper">

              <div className="result-card">

                {round.win ? (
                  <>
                    <h2>
                      Вы выиграли
                    </h2>

                    <p>
                      Вы выбрали
                      правильный
                      стакан.
                    </p>

                    <button
                      className="primary-button"
                      onClick={
                        nextRound
                      }
                    >
                      Следующий
                      раунд →
                    </button>
                  </>
                ) : (
                  <>
                    <h2>
                      Выиграть было
                      невозможно
                    </h2>

                    <p>
                      Ни под одним
                      стаканом не
                      было приза.
                      <br />
                      <br />
                      Правильного
                      выбора не
                      существовало.
                    </p>

                    <button
                      className="primary-button"
                      onClick={
                        continueAfterGame
                      }
                    >
                      Продолжить →
                    </button>
                  </>
                )}

              </div>

            </div>
          )}
        </>
      )}

      {/* GLOBAL FACTS */}

      {stage === 'globalFacts' && (
        <div className="screen-overlay">

          <div
            className="full-fact-card"
            key={
              globalFactIndex
            }
          >

            <div className="eyebrow">
              В МИРЕ
            </div>

            <div className="global-counter">
              {globalFactIndex + 1}
              {' / '}
              {globalFacts.length}
            </div>

            <div className="global-number">
              {
                globalFacts[
                  globalFactIndex
                ].number
              }
            </div>

            <div className="global-title">
              {
                globalFacts[
                  globalFactIndex
                ].title
              }
            </div>

            <div className="global-text">
              {
                globalFacts[
                  globalFactIndex
                ].text
              }
            </div>

            <button
              className="primary-button global-button"
              onClick={
                nextGlobalFact
              }
            >
              Продолжить →
            </button>

          </div>

        </div>
      )}

      {/* KAZAKHSTAN */}

      {stage === 'kazakhstan' && (
        <div className="screen-overlay panel-scroll">

          <div className="kazakhstan-page">

            <div className="eyebrow">
              А ЧТО В КАЗАХСТАНЕ?
            </div>

            <h2 className="kazakhstan-heading">
              Проблема ближе,
              чем кажется
            </h2>

            <div className="kazakhstan-grid">

              {kazakhstanFacts.map(
                (
                  fact,
                  index
                ) => (
                  <div
                    className="kz-card"
                    key={index}
                  >

                    <div className="kz-number">
                      {
                        fact.number
                      }
                    </div>

                    <div className="kz-title">
                      {
                        fact.title
                      }
                    </div>

                  </div>
                )
              )}

            </div>

            <button
              className="primary-button kz-button"
              onClick={() =>
                setStage(
                  'calculator'
                )
              }
            >
              А сколько
              тратите вы? →
            </button>

          </div>

        </div>
      )}

      {/* CALCULATOR */}

      {stage === 'calculator' && (
        <div className="screen-overlay">

          <div className="calculator-card">

            <div className="eyebrow">
              ВАШИ ДЕНЬГИ
            </div>

            <h2>
              Сколько вы обычно
              тратите на
              азартные игры?
            </h2>

            <div className="money-input">

              <input
                type="number"
                min="0"
                placeholder="Например, 20 000"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
              />

              <span>
                ₸
              </span>

            </div>

            <div className="frequency-title">
              Как часто?
            </div>

            <div className="period-buttons">

              <button
                className={
                  period === 'day'
                    ? 'period active'
                    : 'period'
                }
                onClick={() =>
                  setPeriod('day')
                }
              >
                раз в день
              </button>

              <button
                className={
                  period === 'week'
                    ? 'period active'
                    : 'period'
                }
                onClick={() =>
                  setPeriod('week')
                }
              >
                раз в неделю
              </button>

              <button
                className={
                  period === 'month'
                    ? 'period active'
                    : 'period'
                }
                onClick={() =>
                  setPeriod('month')
                }
              >
                раз в месяц
              </button>

            </div>

            <button
              className="primary-button calculate-button"
              disabled={
                !validAmount
              }
              onClick={
                calculate
              }
            >
              Рассчитать →
            </button>

          </div>

        </div>
      )}

      {/* RESULTS */}

      {stage === 'results' && (
        <div className="screen-overlay panel-scroll">

          <div className="calculator-card results-card">

            <div className="eyebrow">
              ВАШ РАСЧЁТ
            </div>

            <div className="entered-label">
              Вы указали
            </div>

            <div className="entered-amount">
              {money(
                numericAmount
              )}
            </div>

            <div className="entered-period">
              {enteredPeriod}
            </div>

            <div className="expense-table">

              <div className="expense-row">
                <span>
                  В день
                </span>

                <strong>
                  {money(daily)}
                </strong>
              </div>

              <div className="expense-row">
                <span>
                  В неделю
                </span>

                <strong>
                  {money(weekly)}
                </strong>
              </div>

              <div className="expense-row">
                <span>
                  В месяц
                </span>

                <strong>
                  {money(monthly)}
                </strong>
              </div>

              <div className="expense-row important-row">
                <span>
                  В год
                </span>

                <strong>
                  {money(yearly)}
                </strong>
              </div>

              <div className="expense-row">
                <span>
                  За 5 лет
                </span>

                <strong>
                  {money(fiveYears)}
                </strong>
              </div>

              <div className="expense-row">
                <span>
                  За 10 лет
                </span>

                <strong>
                  {money(tenYears)}
                </strong>
              </div>

            </div>

            <div className="spending-message">

              <div className="spending-range">
                {
                  spendingMessage.range
                }
              </div>

              <div className="spending-heading">
                {
                  spendingMessage.heading
                }
              </div>

              <div className="spending-text">
                {
                  spendingMessage.text
                }
              </div>

            </div>

            <div className="result-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  setStage(
                    'calculator'
                  )
                }
              >
                Изменить сумму
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  setStage(
                    'choice'
                  )
                }
              >
                Продолжить →
              </button>

            </div>

          </div>

        </div>
      )}

      {/* CHOICE */}

      {stage === 'choice' && (
        <div className="screen-overlay">

          <div className="decision-card">

            <div className="eyebrow">
              СЛЕДУЮЩИЙ ВЫБОР
            </div>

            <h2>
              Выигрыш не делает
              игру безопасной
            </h2>

            <p>
              Вы уже увидели,
              во что регулярные
              ставки могут
              превращаться
              в цифрах.
            </p>

            <div className="choice-grid">

              <button
                className="choice-button"
                onClick={() =>
                  setStage(
                    'reduce'
                  )
                }
              >
                <strong>
                  Тратить меньше
                </strong>

                <span>
                  Попробовать
                  ограничить расходы
                </span>
              </button>

              <button
                className="choice-button choice-primary"
                onClick={() =>
                  setStage(
                    'stop'
                  )
                }
              >
                <strong>
                  Перестать играть
                </strong>

                <span>
                  Узнать, что можно
                  сделать сейчас
                </span>
              </button>

              <button
                className="choice-button choice-muted"
                onClick={() =>
                  setStage(
                    'continuePlaying'
                  )
                }
              >
                <strong>
                  Продолжить играть
                </strong>

                <span>
                  Играть дальше,
                  несмотря на риск
                </span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* REDUCE */}

      {stage === 'reduce' && (
        <div className="screen-overlay">

          <div className="decision-card">

            <div className="eyebrow">
              ТРАТИТЬ МЕНЬШЕ
            </div>

            <h2>
              Это шаг.
              Но риск остаётся.
            </h2>

            <p>
              Сокращение расходов
              может уменьшить
              финансовые потери,
              но сама игра
              остаётся частью
              вашей жизни.
            </p>

            <div className="highlight-box">
              Если контролировать
              лимиты становится
              трудно, прекращение игры
              создаёт более сильный
              барьер для дальнейших
              расходов.
            </div>

            <button
              className="primary-button full-button"
              onClick={() =>
                setStage(
                  'stop'
                )
              }
            >
              Хочу прекратить играть →
            </button>

            <button
              className="text-button"
              onClick={() =>
                setStage(
                  'choice'
                )
              }
            >
              Назад
            </button>

          </div>

        </div>
      )}

      {/* CONTINUE PLAYING */}

      {stage === 'continuePlaying' && (
        <div className="screen-overlay">

          <div className="decision-card">

            <div className="eyebrow">
              ПЕРЕД СЛЕДУЮЩЕЙ СТАВКОЙ
            </div>

            <h2>
              Ты никогда
              не выиграешь
            </h2>

            <p>
              Отдельный выигрыш возможен,
              но он не меняет сам принцип игры:
              чем дольше человек продолжает играть,
              тем выше риск потерять деньги.
            </p>

            <div className="choice-grid">

              <button
                className="choice-button"
                onClick={() =>
                  setStage(
                    'reduce'
                  )
                }
              >
                <strong>
                  Тратить меньше
                </strong>

                <span>
                  Попробовать
                  ограничить расходы
                </span>
              </button>

              <button
                className="choice-button choice-primary"
                onClick={() =>
                  setStage(
                    'stop'
                  )
                }
              >
                <strong>
                  Перестать играть
                </strong>

                <span>
                  Узнать, что можно
                  сделать сейчас
                </span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* STOP */}

      {stage === 'stop' && (
        <div className="screen-overlay panel-scroll">

          <div className="help-page">

            <div className="eyebrow">
              ЧТО МОЖНО СДЕЛАТЬ СЕЙЧАС
            </div>

            <h2>
              Уменьшите возможность
              сделать следующую ставку
            </h2>

            <div className="help-grid">

              <div className="help-card">

                <div className="help-number">
                  01
                </div>

                <h3>
                  Уберите быстрый доступ
                </h3>

                <p>
                  Удалите приложения
                  и закладки игровых
                  сервисов.
                  Отключите рекламные
                  уведомления.
                </p>

              </div>

              <div className="help-card">

                <div className="help-number">
                  02
                </div>

                <h3>
                  Усложните доступ
                  к деньгам
                </h3>

                <p>
                  Уберите сохранённые
                  банковские карты
                  и установите лимиты
                  на расходы
                  и переводы.
                </p>

              </div>

              <div className="help-card">

                <div className="help-number">
                  03
                </div>

                <h3>
                  Используйте
                  самоограничение
                </h3>

                <p>
                  Официальное
                  самоограничение
                  может создать
                  дополнительный
                  барьер между вами
                  и следующей ставкой.
                </p>

              </div>

              <div className="help-card">

                <div className="help-number">
                  04
                </div>

                <h3>
                  Поговорите
                  с кем-то
                </h3>

                <p>
                  Можно обратиться
                  к близкому человеку
                  или специалисту,
                  если самостоятельно
                  остановиться трудно.
                </p>

              </div>

            </div>

            <button
              className="primary-button"
              onClick={() =>
                setStage(
                  'final'
                )
              }
            >
              Продолжить →
            </button>

          </div>

        </div>
      )}

      {/* FINAL */}

      {stage === 'final' && (
        <div className="screen-overlay">

          <div className="final-card">

            <div className="eyebrow">
              ФИНАЛ
            </div>

            <h2>
              Следующий выбор
              остаётся за вами
            </h2>

            <p>
              Вы увидели игру,
              мировой масштаб,
              ситуацию в Казахстане
              и собственные расходы.
            </p>

            <div className="final-quote">
              Можно начать
              не с решения
              на всю жизнь,
              а с одной вещи:
              <br />
              не делать следующую
              ставку сегодня.
            </div>

            <button
              className="primary-button"
              onClick={() => {
                setStage('start')
                setRoundIndex(0)
                setSelectedCup(null)
                setRevealAll(false)
                setShowResult(false)
                setGlobalFactIndex(0)
                setAmount('')
                setPeriod('week')
                setCountdown(5)
              }}
            >
              Начать сначала
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default App
