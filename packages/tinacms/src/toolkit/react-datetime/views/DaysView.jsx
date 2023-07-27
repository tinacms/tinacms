/**

*/

import React from 'react'
import ViewNavigation from '../parts/ViewNavigation'

export default class DaysView extends React.Component {
  static defaultProps = {
    isValidDate: () => true,
    renderDay: (props, date) => <td {...props}>{date.date()}</td>,
  }

  render() {
    return (
      <div className="rdtDays">
        <table>
          <thead>
            {this.renderNavigation()}
            {this.renderDayHeaders()}
          </thead>
          <tbody>{this.renderDays()}</tbody>
          {this.renderFooter()}
        </table>
      </div>
    )
  }

  renderNavigation() {
    const date = this.props.viewDate
    const locale = date.localeData()
    return (
      <ViewNavigation
        onClickPrev={() => this.props.navigate(-1, 'months')}
        onClickSwitch={() => this.props.showView('months')}
        onClickNext={() => this.props.navigate(1, 'months')}
        switchContent={locale.months(date) + ' ' + date.year()}
        switchColSpan={5}
        switchProps={{ 'data-value': this.props.viewDate.month() }}
      />
    )
  }

  renderDayHeaders() {
    const locale = this.props.viewDate.localeData()
    let dayItems = getDaysOfWeek(locale).map((day, index) => (
      <th key={day + index} className="dow">
        {day}
      </th>
    ))

    return <tr>{dayItems}</tr>
  }

  renderDays() {
    const date = this.props.viewDate
    const startOfMonth = date.clone().startOf('month')
    const endOfMonth = date.clone().endOf('month')

    // We need 42 days in 6 rows
    // starting in the last week of the previous month
    let rows = [[], [], [], [], [], []]

    let startDate = date.clone().subtract(1, 'months')
    startDate.date(startDate.daysInMonth()).startOf('week')

    let endDate = startDate.clone().add(42, 'd')
    let i = 0

    while (startDate.isBefore(endDate)) {
      let row = getRow(rows, i++)
      row.push(this.renderDay(startDate, startOfMonth, endOfMonth))
      startDate.add(1, 'd')
    }

    return rows.map((r, i) => <tr key={`${endDate.month()}_${i}`}>{r}</tr>)
  }

  renderDay(date, startOfMonth, endOfMonth) {
    let selectedDate = this.props.selectedDate

    let dayProps = {
      key: date.format('M_D'),
      'data-value': date.date(),
      'data-month': date.month(),
      'data-year': date.year(),
    }

    let className = 'rdtDay'
    if (date.isBefore(startOfMonth)) {
      className += ' rdtOld'
    } else if (date.isAfter(endOfMonth)) {
      className += ' rdtNew'
    }
    if (selectedDate && date.isSame(selectedDate, 'day')) {
      className += ' rdtActive'
    }
    if (date.isSame(this.props.moment(), 'day')) {
      className += ' rdtToday'
    }

    if (this.props.isValidDate(date)) {
      dayProps.onClick = this._setDate
    } else {
      className += ' rdtDisabled'
    }

    dayProps.className = className

    return this.props.renderDay(
      dayProps,
      date.clone(),
      selectedDate && selectedDate.clone()
    )
  }

  renderFooter() {
    if (!this.props.timeFormat) return

    const date = this.props.viewDate
    return (
      <tfoot>
        <tr>
          <td
            onClick={() => this.props.showView('time')}
            colSpan={7}
            className="rdtTimeToggle"
          >
            {date.format(this.props.timeFormat)}
          </td>
        </tr>
      </tfoot>
    )
  }

  _setDate = (e) => {
    this.props.updateDate(e)
  }
}

function getRow(rows, day) {
  return rows[Math.floor(day / 7)]
}

/**
 * Get a list of the days of the week
 * depending on the current locale
 * @return {array} A list with the shortname of the days
 */
function getDaysOfWeek(locale) {
  const first = locale.firstDayOfWeek()
  let dow = []
  let i = 0

  locale._weekdaysMin.forEach(function (day) {
    dow[(7 + i++ - first) % 7] = day
  })

  return dow
}
