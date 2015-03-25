

import sys
import time
import clr
from ArdupilotMega import *

print 'Starting Mission'

item = Locationwp()

Script.ChangeMode(auto)
Locationwp.lat.SetValue(item,39.343674)
Locationwp.lng.SetValue(item,-86.029741)
Locationwp.alt.SetValue(item,45.720000)
MAV.setGuidedModeWP(item)

sleep(30)

Locationwp.lat.SetValue(item,39.345358)
Locationwp.lng.SetValue(item,-86.029054)
Locationwp.alt.SetValue(item,76.199999)
MAV.setGuidedModeWP(item)

sleep(30)

Locationwp.lat.SetValue(item,39.342106)
Locationwp.lng.SetValue(item,-86.031371)
Locationwp.alt.SetValue(item,53.340000)
MAV.setGuidedModeWP(item)

sleep(30)

Locationwp.lat.SetValue(item,39.343540)
Locationwp.lng.SetValue(item,-86.028732)
Locationwp.alt.SetValue(item,76.199999)
MAV.setGuidedModeWP(item)

sleep(30)

Script.ChangeMode(rtl)
