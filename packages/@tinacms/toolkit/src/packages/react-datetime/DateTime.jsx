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

import PropTypes from 'prop-types'
import moment from 'moment'
import React from 'react'
import DaysView from './views/DaysView'
import MonthsView from './views/MonthsView'
import YearsView from './views/YearsView'
import TimeView from './views/TimeView'
import onClickOutside from 'react-onclickoutside'

const viewModes = {
  YEARS: 'years',
  MONTHS: 'months',
  DAYS: 'days',
  TIME: 'time',
}

const TYPES = PropTypes
const nofn = function () {}
const datetype = TYPES.oneOfType([
  TYPES.instanceOf(moment),
  TYPES.instanceOf(Date),
  TYPES.string,
])

export default class Datetime extends React.Component {
  static propTypes = {
    value: datetype,
    initialValue: datetype,
    initialViewDate: datetype,
    initialViewMode: TYPES.oneOf([
      viewModes.YEARS,
      viewModes.MONTHS,
      viewModes.DAYS,
      viewModes.TIME,
    ]),
    onOpen: TYPES.func,
    onClose: TYPES.func,
    onChange: TYPES.func,
    onNavigate: TYPES.func,
    onBeforeNavigate: TYPES.func,
    onNavigateBack: TYPES.func,
    onNavigateForward: TYPES.func,
    updateOnView: TYPES.string,
    locale: TYPES.string,
    utc: TYPES.bool,
    displayTimeZone: TYPES.string,
    input: TYPES.bool,
    dateFormat: TYPES.oneOfType([TYPES.string, TYPES.bool]),
    timeFormat: TYPES.oneOfType([TYPES.string, TYPES.bool]),
    inputProps: TYPES.object,
    timeConstraints: TYPES.object,
    isValidDate: TYPES.func,
    open: TYPES.bool,
    strictParsing: TYPES.bool,
    closeOnSelect: TYPES.bool,
    closeOnTab: TYPES.bool,
    renderView: TYPES.func,
    renderInput: TYPES.func,
    renderDay: TYPES.func,
    renderMonth: TYPES.func,
    renderYear: TYPES.func,
  }

  static defaultProps = {
    onOpen: nofn,
    onClose: nofn,
    onCalendarOpen: nofn,
    onCalendarClose: nofn,
    onChange: nofn,
    onNavigate: nofn,
    onBeforeNavigate: function (next) {
      return next
    },
    onNavigateBack: nofn,
    onNavigateForward: nofn,
    dateFormat: true,
    timeFormat: true,
    utc: false,
    className: '',
    input: true,
    inputProps: {},
    timeConstraints: {},
    isValidDate: function () {
      return true
    },
    strictParsing: true,
    closeOnSelect: false,
    closeOnTab: true,
    closeOnClickOutside: true,
    renderView: (_, renderFunc) => renderFunc(),
  }

  // Make moment accessible through the Datetime class
  static moment = moment

  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  render() {
    return (
      <ClickableWrapper
        className={this.getClassName()}
        onClickOut={this._handleClickOutside}
      >
        {this.renderInput()}
        <div className="rdtPicker">{this.renderView()}</div>
      </ClickableWrapper>
    )
  }

  renderInput() {
    if (!this.props.input) return

    const finalInputProps = {
      type: 'text',
      className: 'form-control',
      value: this.getInputValue(),
      ...this.props.inputProps,
      onFocus: this._onInputFocus,
      onChange: this._onInputChange,
      onKeyDown: this._onInputKeyDown,
      onClick: this._onInputClick,
    }

    if (this.props.renderInput) {
      return (
        <div>
          {this.props.renderInput(
            finalInputProps,
            this._openCalendar,
            this._closeCalendar
          )}
        </div>
      )
    }

    return <input {...finalInputProps} />
  }

  renderView() {
    return this.props.renderView(this.state.currentView, this._renderCalendar)
  }

  _renderCalendar = () => {
    const props = this.props
    const state = this.state

    let viewProps = {
      viewDate: state.viewDate.clone(),
      selectedDate: this.getSelectedDate(),
      isValidDate: props.isValidDate,
      updateDate: this._updateDate,
      navigate: this._viewNavigate,
      moment: moment,
      showView: this._showView,
    }

    // Probably updateOn, updateSelectedDate and setDate can be merged in the same method
    // that would update viewDate or selectedDate depending on the view and the dateFormat
    switch (state.currentView) {
      case viewModes.YEARS:
        // Used viewProps
        // { viewDate, selectedDate, renderYear, isValidDate, navigate, showView, updateDate }
        viewProps.renderYear = props.renderYear
        return <YearsView {...viewProps} />

      case viewModes.MONTHS:
        // { viewDate, selectedDate, renderMonth, isValidDate, navigate, showView, updateDate }
        viewProps.renderMonth = props.renderMonth
        return <MonthsView {...viewProps} />

      case viewModes.DAYS:
        // { viewDate, selectedDate, renderDay, isValidDate, navigate, showView, updateDate, timeFormat
        viewProps.renderDay = props.renderDay
        viewProps.timeFormat = this.getFormat('time')
        return <DaysView {...viewProps} />

      default:
        // { viewDate, selectedDate, timeFormat, dateFormat, timeConstraints, setTime, showView }
        viewProps.dateFormat = this.getFormat('date')
        viewProps.timeFormat = this.getFormat('time')
        viewProps.timeConstraints = props.timeConstraints
        viewProps.setTime = this._setTime
        return <TimeView {...viewProps} />
    }
  }

  getInitialState() {
    let props = this.props
    let inputFormat = this.getFormat('datetime')
    let selectedDate = this.parseDate(
      props.value || props.initialValue,
      inputFormat
    )

    this.checkTZ()

    return {
      open: !props.input,
      currentView: props.initialViewMode || this.getInitialView(),
      viewDate: this.getInitialViewDate(selectedDate),
      selectedDate:
        selectedDate && selectedDate.isValid() ? selectedDate : undefined,
      inputValue: this.getInitialInputValue(selectedDate),
    }
  }

  getInitialViewDate(selectedDate) {
    const propDate = this.props.initialViewDate
    let viewDate
    if (propDate) {
      viewDate = this.parseDate(propDate, this.getFormat('datetime'))
      if (viewDate && viewDate.isValid()) {
        return viewDate
      } else {
        log(
          'The initialViewDated given "' +
            propDate +
            '" is not valid. Using current date instead.'
        )
      }
    } else if (selectedDate && selectedDate.isValid()) {
      return selectedDate.clone()
    }
    return this.getInitialDate()
  }

  getInitialDate() {
    let m = this.localMoment()
    m.hour(0).minute(0).second(0).millisecond(0)
    return m
  }

  getInitialView() {
    const dateFormat = this.getFormat('date')
    return dateFormat ? this.getUpdateOn(dateFormat) : viewModes.TIME
  }

  parseDate(date, dateFormat) {
    let parsedDate

    if (date && typeof date === 'string')
      parsedDate = this.localMoment(date, dateFormat)
    else if (date) parsedDate = this.localMoment(date)

    if (parsedDate && !parsedDate.isValid()) parsedDate = null

    return parsedDate
  }

  getClassName() {
    let cn = 'rdt'
    let props = this.props
    let propCn = props.className

    if (Array.isArray(propCn)) {
      cn += ' ' + propCn.join(' ')
    } else if (propCn) {
      cn += ' ' + propCn
    }

    if (!props.input) {
      cn += ' rdtStatic'
    }
    if (this.isOpen()) {
      cn += ' rdtOpen'
    }

    return cn
  }

  isOpen() {
    return (
      !this.props.input ||
      (this.props.open === undefined ? this.state.open : this.props.open)
    )
  }

  getUpdateOn(dateFormat) {
    if (this.props.updateOnView) {
      return this.props.updateOnView
    }

    if (dateFormat.match(/[lLD]/)) {
      return viewModes.DAYS
    }

    if (dateFormat.indexOf('M') !== -1) {
      return viewModes.MONTHS
    }

    if (dateFormat.indexOf('Y') !== -1) {
      return viewModes.YEARS
    }

    return viewModes.DAYS
  }

  getLocaleData() {
    let p = this.props
    return this.localMoment(
      p.value || p.defaultValue || new Date()
    ).localeData()
  }

  getDateFormat() {
    const locale = this.getLocaleData()
    let format = this.props.dateFormat
    if (format === true) return locale.longDateFormat('L')
    if (format) return format
    return ''
  }

  getTimeFormat() {
    const locale = this.getLocaleData()
    let format = this.props.timeFormat
    if (format === true) {
      return locale.longDateFormat('LT')
    }
    return format || ''
  }

  getFormat(type) {
    if (type === 'date') {
      return this.getDateFormat()
    } else if (type === 'time') {
      return this.getTimeFormat()
    }

    let dateFormat = this.getDateFormat()
    let timeFormat = this.getTimeFormat()
    return dateFormat && timeFormat
      ? dateFormat + ' ' + timeFormat
      : dateFormat || timeFormat
  }

  _showView = (view, date) => {
    const d = (date || this.state.viewDate).clone()
    const nextView = this.props.onBeforeNavigate(
      view,
      this.state.currentView,
      d
    )

    if (nextView && this.state.currentView !== nextView) {
      this.props.onNavigate(nextView)
      this.setState({ currentView: nextView })
    }
  }

  updateTime(op, amount, type, toSelected) {
    let update = {}
    const date = toSelected ? 'selectedDate' : 'viewDate'

    update[date] = this.state[date].clone()[op](amount, type)

    this.setState(update)
  }

  viewToMethod = { days: 'date', months: 'month', years: 'year' }
  nextView = { days: 'time', months: 'days', years: 'months' }
  _updateDate = (e) => {
    let state = this.state
    let currentView = state.currentView
    let updateOnView = this.getUpdateOn(this.getFormat('date'))
    let viewDate = this.state.viewDate.clone()

    // Set the value into day/month/year
    viewDate[this.viewToMethod[currentView]](
      parseInt(e.target.getAttribute('data-value'), 10)
    )

    // Need to set month and year will for days view (prev/next month)
    if (currentView === 'days') {
      viewDate.month(parseInt(e.target.getAttribute('data-month'), 10))
      viewDate.year(parseInt(e.target.getAttribute('data-year'), 10))
    }

    let update = { viewDate: viewDate }
    if (currentView === updateOnView) {
      update.selectedDate = viewDate.clone()
      update.inputValue = viewDate.format(this.getFormat('datetime'))

      if (
        this.props.open === undefined &&
        this.props.input &&
        this.props.closeOnSelect
      ) {
        this._closeCalendar()
      }

      this.props.onChange(viewDate.clone())
    } else {
      this._showView(this.nextView[currentView], viewDate)
    }

    this.setState(update)
  }

  _viewNavigate = (modifier, unit) => {
    let viewDate = this.state.viewDate.clone()

    // Subtracting is just adding negative time
    viewDate.add(modifier, unit)

    if (modifier > 0) {
      this.props.onNavigateForward(modifier, unit)
    } else {
      this.props.onNavigateBack(-modifier, unit)
    }

    this.setState({ viewDate })
  }

  _setTime = (type, value) => {
    let date = (this.getSelectedDate() || this.state.viewDate).clone()

    date[type](value)

    if (!this.props.value) {
      this.setState({
        selectedDate: date,
        viewDate: date.clone(),
        inputValue: date.format(this.getFormat('datetime')),
      })
    }

    this.props.onChange(date)
  }

  _openCalendar = () => {
    if (this.isOpen()) return
    this.setState({ open: true }, this.props.onOpen)
  }

  _closeCalendar = () => {
    if (!this.isOpen()) return

    this.setState({ open: false }, () => {
      this.props.onClose(this.state.selectedDate || this.state.inputValue)
    })
  }

  _handleClickOutside = () => {
    let props = this.props

    if (
      props.input &&
      this.state.open &&
      props.open === undefined &&
      props.closeOnClickOutside
    ) {
      this._closeCalendar()
    }
  }

  localMoment(date, format, props) {
    props = props || this.props
    let m = null

    if (props.utc) {
      m = moment.utc(date, format, props.strictParsing)
    } else if (props.displayTimeZone) {
      m = moment.tz(date, format, props.displayTimeZone)
    } else {
      m = moment(date, format, props.strictParsing)
    }

    if (props.locale) m.locale(props.locale)
    return m
  }

  checkTZ() {
    const { displayTimeZone } = this.props
    if (displayTimeZone && !this.tzWarning && !moment.tz) {
      this.tzWarning = true
      log(
        'displayTimeZone prop with value "' +
          displayTimeZone +
          '" is used but moment.js timezone is not loaded.',
        'error'
      )
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return

    let needsUpdate = false
    let thisProps = this.props

    ;['locale', 'utc', 'displayZone', 'dateFormat', 'timeFormat'].forEach(
      function (p) {
        prevProps[p] !== thisProps[p] && (needsUpdate = true)
      }
    )

    if (needsUpdate) {
      this.regenerateDates()
    }

    if (thisProps.value && thisProps.value !== prevProps.value) {
      this.setViewDate(thisProps.value)
    }

    this.checkTZ()
  }

  regenerateDates() {
    const props = this.props
    let viewDate = this.state.viewDate.clone()
    let selectedDate =
      this.state.selectedDate && this.state.selectedDate.clone()

    if (props.locale) {
      viewDate.locale(props.locale)
      selectedDate && selectedDate.locale(props.locale)
    }
    if (props.utc) {
      viewDate.utc()
      selectedDate && selectedDate.utc()
    } else if (props.displayTimeZone) {
      viewDate.tz(props.displayTimeZone)
      selectedDate && selectedDate.tz(props.displayTimeZone)
    } else {
      viewDate.locale()
      selectedDate && selectedDate.locale()
    }

    let update = { viewDate: viewDate, selectedDate: selectedDate }
    if (selectedDate && selectedDate.isValid()) {
      update.inputValue = selectedDate.format(this.getFormat('datetime'))
    }

    this.setState(update)
  }

  getSelectedDate() {
    if (this.props.value === undefined) return this.state.selectedDate
    let selectedDate = this.parseDate(
      this.props.value,
      this.getFormat('datetime')
    )
    return selectedDate && selectedDate.isValid() ? selectedDate : false
  }

  getInitialInputValue(selectedDate) {
    const props = this.props
    if (props.inputProps.value) return props.inputProps.value

    if (selectedDate && selectedDate.isValid())
      return selectedDate.format(this.getFormat('datetime'))

    if (props.value && typeof props.value === 'string') return props.value

    if (props.initialValue && typeof props.initialValue === 'string')
      return props.initialValue

    return ''
  }

  getInputValue() {
    let selectedDate = this.getSelectedDate()
    return selectedDate
      ? selectedDate.format(this.getFormat('datetime'))
      : this.state.inputValue
  }

  /**
   * Set the date that is currently shown in the calendar.
   * This is independent from the selected date and it's the one used to navigate through months or days in the calendar.
   * @param dateType date
   * @public
   */
  setViewDate(date) {
    let logError = function () {
      return log('Invalid date passed to the `setViewDate` method: ' + date)
    }

    if (!date) return logError()

    let viewDate
    if (typeof date === 'string') {
      viewDate = this.localMoment(date, this.getFormat('datetime'))
    } else {
      viewDate = this.localMoment(date)
    }

    if (!viewDate || !viewDate.isValid()) return logError()
    this.setState({ viewDate: viewDate })
  }

  /**
   * Set the view currently shown by the calendar. View modes shipped with react-datetime are 'years', 'months', 'days' and 'time'.
   * @param TYPES.string mode
   */
  navigate(mode) {
    this._showView(mode)
  }

  _onInputFocus = (e) => {
    if (!this.callHandler(this.props.inputProps.onFocus, e)) return
    this._openCalendar()
  }

  _onInputChange = (e) => {
    if (!this.callHandler(this.props.inputProps.onChange, e)) return

    const value = e.target ? e.target.value : e
    const localMoment = this.localMoment(value, this.getFormat('datetime'))
    let update = { inputValue: value }

    if (localMoment.isValid()) {
      update.selectedDate = localMoment
      update.viewDate = localMoment.clone().startOf('month')
    } else {
      update.selectedDate = null
    }

    this.setState(update, () => {
      this.props.onChange(
        localMoment.isValid() ? localMoment : this.state.inputValue
      )
    })
  }

  _onInputKeyDown = (e) => {
    if (!this.callHandler(this.props.inputProps.onKeyDown, e)) return

    if (e.which === 9 && this.props.closeOnTab) {
      this._closeCalendar()
    }
  }

  _onInputClick = (e) => {
    // Focus event should open the calendar, but there is some case where
    // the input is already focused and the picker is closed, so clicking the input
    // should open it again see https://github.com/arqex/react-datetime/issues/717
    if (!this.callHandler(this.props.inputProps.onClick, e)) return
    this._openCalendar()
  }

  callHandler(method, e) {
    if (!method) return true
    return method(e) !== false
  }
}

function log(message, method) {
  let con = typeof window !== 'undefined' && window.console
  if (!con) return

  if (!method) {
    method = 'warn'
  }
  con[method]('***react-datetime:' + message)
}

class ClickOutBase extends React.Component {
  container = React.createRef()

  render() {
    return (
      <div className={this.props.className} ref={this.container}>
        {this.props.children}
      </div>
    )
  }
  handleClickOutside(e) {
    this.props.onClickOut(e)
  }

  setClickOutsideRef() {
    return this.container.current
  }
}

const ClickableWrapper = onClickOutside(ClickOutBase)
