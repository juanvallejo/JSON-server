

import sys
import time
import clr
from ArdupilotMega import *

print 'Starting Mission'

item = Locationwp()
i = 1
while(i < 5)  {
  Script.ChangeMode(auto)
  Locationwp.lat.SetValue(item,39.343674)
  Locationwp.lng.SetValue(item,-86.029741)
  Locationwp.alt.SetValue(item,45.720000)
  MAV.setGuidedModeWP(item)

  sleep(30)
  i = i+1
}

Script.ChangeMode(rtl)
