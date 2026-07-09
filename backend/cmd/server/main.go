package main

import "github.com/labstack/echo/v5"

func main() {
	e := echo.New()
	
	if err := e.Start(":1323"); err != nil {
    	e.Logger.Error("failed to start server", "error", err)
  	}
}