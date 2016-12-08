from time import sleep
import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(22,GPIO.OUT,initial=GPIO.HIGH)

#reset
GPIO.output(22,0)
sleep(1)
GPIO.output(22,1)
