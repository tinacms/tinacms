/**

*/

import React from 'react'

const timeConstraints = {
  hours: {
    min: 0,
    max: 23,
    step: 1,
  },
  minutes: {
    min: 0,
    max: 59,
    step: 1,
  },
  seconds: {
    min: 0,
    max: 59,
    step: 1,
  },
  milliseconds: {
    min: 0,
    max: 999,
    step: 1,
  },
}

function createConstraints(overrideTimeConstraints) {
  let constraints = {}

  Object.keys(timeConstraints).forEach((type) => {
    constraints[type] = {
      ...timeConstraints[type],
      ...(overrideTimeConstraints[type] || {}),
    }
  })

  return constraints
}

export default class TimeView extends React.Component {
  constructor(props) {
    super(props)

    this.constraints = createConstraints(props.timeConstraints)

    // This component buffers the time part values in the state
    // while the user is pressing down the buttons
    // and call the prop `setTime` when the buttons are released
    this.state = this.getTimeParts(props.selectedDate || props.viewDate)
  }

  render() {
    let items = []
    const timeParts = this.state

    this.getCounters().forEach((c, i) => {
      if (i && c !== 'ampm') {
        items.push(
          <div key={`sep${i}`} className="rdtCounterSeparator">
            :
          </div>
        )
      }

      items.push(this.renderCounter(c, timeParts[c]))
    })

    return (
      <div className="rdtTime">
        <table>
          {this.renderHeader()}
          <tbody>
            <tr>
              <td>
                <div className="rdtCounters">{items}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  renderCounter(type, value) {
    if (type === 'hours' && this.isAMPM()) {
      value = ((value - 1) % 12) + 1

      if (value === 0) {
        value = 12
      }
    }

    if (type === 'ampm') {
      if (this.props.timeFormat.indexOf(' A') !== -1) {
        value = this.props.viewDate.format('A')
      } else {
        value = this.props.viewDate.format('a')
      }
    }

    return (
      <div key={type} className="rdtCounter">
        <span
          className="rdtBtn"
          onMouseDown={(e) => this.onStartClicking(e, 'increase', type)}
        >
          ▲
        </span>
        <div className="rdtCount">{value}</div>
        <span
          className="rdtBtn"
          onMouseDown={(e) => this.onStartClicking(e, 'decrease', type)}
        >
          ▼
        </span>
      </div>
    )
  }

  renderHeader() {
    if (!this.props.dateFormat) return

    const date = this.props.selectedDate || this.props.viewDate

    return (
      <thead>
        <tr>
          <td
            className="rdtSwitch"
            colSpan="4"
            onClick={() => this.props.showView('days')}
          >
            {date.format(this.props.dateFormat)}
          </td>
        </tr>
      </thead>
    )
  }

  onStartClicking(e, action, type) {
    if (e && e.button && e.button !== 0) {
      // Only left clicks, thanks
      return
    }

    if (type === 'ampm') return this.toggleDayPart()

    let update = {}
    let body = document.body
    update[type] = this[action](type)
    this.setState(update)

    this.timer = setTimeout(() => {
      this.increaseTimer = setInterval(() => {
        update[type] = this[action](type)
        this.setState(update)
      }, 70)
    }, 500)

    this.mouseUpListener = () => {
      clearTimeout(this.timer)
      clearInterval(this.increaseTimer)
      this.props.setTime(type, parseInt(this.state[type], 10))
      body.removeEventListener('mouseup', this.mouseUpListener)
      body.removeEventListener('touchend', this.mouseUpListener)
    }

    body.addEventListener('mouseup', this.mouseUpListener)
    body.addEventListener('touchend', this.mouseUpListener)
  }

  toggleDayPart() {
    let hours = parseInt(this.state.hours, 10)

    if (hours >= 12) {
      hours -= 12
    } else {
      hours += 12
    }

    this.props.setTime('hours', hours)
  }

  increase(type) {
    const tc = this.constraints[type]
    let value = parseInt(this.state[type], 10) + tc.step
    if (value > tc.max) value = tc.min + (value - (tc.max + 1))
    return pad(type, value)
  }

  decrease(type) {
    const tc = this.constraints[type]
    let value = parseInt(this.state[type], 10) - tc.step
    if (value < tc.min) value = tc.max + 1 - (tc.min - value)
    return pad(type, value)
  }

  getCounters() {
    let counters = []
    let format = this.props.timeFormat

    if (format.toLowerCase().indexOf('h') !== -1) {
      counters.push('hours')
      if (format.indexOf('m') !== -1) {
        counters.push('minutes')
        if (format.indexOf('s') !== -1) {
          counters.push('seconds')
          if (format.indexOf('S') !== -1) {
            counters.push('milliseconds')
          }
        }
      }
    }

    if (this.isAMPM()) {
      counters.push('ampm')
    }

    return counters
  }

  isAMPM() {
    return this.props.timeFormat.toLowerCase().indexOf(' a') !== -1
  }

  getTimeParts(date) {
    const hours = date.hours()

    return {
      hours: pad('hours', hours),
      minutes: pad('minutes', date.minutes()),
      seconds: pad('seconds', date.seconds()),
      milliseconds: pad('milliseconds', date.milliseconds()),
      ampm: hours < 12 ? 'am' : 'pm',
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedDate) {
      if (this.props.selectedDate !== prevProps.selectedDate) {
        this.setState(this.getTimeParts(this.props.selectedDate))
      }
    } else if (prevProps.viewDate !== this.props.viewDate) {
      this.setState(this.getTimeParts(this.props.viewDate))
    }
  }
}

function pad(type, value) {
  const padValues = {
    hours: 1,
    minutes: 2,
    seconds: 2,
    milliseconds: 3,
  }

  let str = value + ''
  while (str.length < padValues[type]) str = '0' + str
  return str
}
