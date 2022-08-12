/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import ViewNavigation from '../parts/ViewNavigation'

export default class YearsView extends React.Component {
  static defaultProps = {
    renderYear: (props, year) => <td {...props}>{year}</td>,
  }

  render() {
    return (
      <div className="rdtYears">
        <table>
          <thead>{this.renderNavigation()}</thead>
        </table>
        <table>
          <tbody>{this.renderYears()}</tbody>
        </table>
      </div>
    )
  }

  renderNavigation() {
    const viewYear = this.getViewYear()
    return (
      <ViewNavigation
        onClickPrev={() => this.props.navigate(-10, 'years')}
        onClickSwitch={() => this.props.showView('years')}
        onClickNext={() => this.props.navigate(10, 'years')}
        switchContent={`${viewYear}-${viewYear + 9}`}
      />
    )
  }

  renderYears() {
    const viewYear = this.getViewYear()
    // 12 years in 3 rows for every view
    let rows = [[], [], []]
    for (let year = viewYear - 1; year < viewYear + 11; year++) {
      let row = getRow(rows, year - viewYear)

      row.push(this.renderYear(year))
    }

    return rows.map((years, i) => <tr key={i}>{years}</tr>)
  }

  renderYear(year) {
    const selectedYear = this.getSelectedYear()
    let className = 'rdtYear'
    let onClick

    if (this.isDisabledYear(year)) {
      className += ' rdtDisabled'
    } else {
      onClick = this._updateSelectedYear
    }

    if (selectedYear === year) {
      className += ' rdtActive'
    }

    let props = { key: year, className, 'data-value': year, onClick }

    return this.props.renderYear(
      props,
      year,
      this.props.selectedDate && this.props.selectedDate.clone()
    )
  }

  getViewYear() {
    return parseInt(this.props.viewDate.year() / 10, 10) * 10
  }

  getSelectedYear() {
    return this.props.selectedDate && this.props.selectedDate.year()
  }

  disabledYearsCache = {}
  isDisabledYear(year) {
    let cache = this.disabledYearsCache
    if (cache[year] !== undefined) {
      return cache[year]
    }

    let isValidDate = this.props.isValidDate

    if (!isValidDate) {
      // If no validator is set, all days are valid
      return false
    }

    // If one day in the year is valid, the year should be clickable
    let date = this.props.viewDate.clone().set({ year })
    let day = date.endOf('year').dayOfYear() + 1

    while (day-- > 1) {
      if (isValidDate(date.dayOfYear(day))) {
        cache[year] = false
        return false
      }
    }

    cache[year] = true
    return true
  }

  _updateSelectedYear = (event) => {
    this.props.updateDate(event)
  }
}

function getRow(rows, year) {
  if (year < 3) {
    return rows[0]
  }
  if (year < 7) {
    return rows[1]
  }

  return rows[2]
}
