"use strict";

let debug = true;

class Graph
{
	// Handle plotting and manipulating graphs

	constructor(element)
	{
		this.element = element;

		this.initialize();
	}

	set element(element)
	{
		try
		{
			if (typeof jQuery === "undefined")
			{
				throw new ReferenceError("jQuery library can't be found");
			}

			if (!(element instanceof jQuery))
			{
				throw new TypeError("Element is not a jQuery element");
			}

			this.raw_element = element;
		}
		catch (error)
		{
			if (debug) {console.log(error);}
			throw error;
		}
	}

	get element()
	{
		return this.raw_element;
	}

	set_cursor_x_position(x)
	{
		// Set line position
		this.element.find(".cursor > line").attr(
		{
			x1: x + "%",
			x2: x + "%"
		});

		// Set circle position
		this.element.find(".cursor > circle").attr('cx', x + "%");
	}

	get_cursor_x_position(x)
	{
		// Convert x to percentage and return it
		return x / this.element.width() * 100;
	}

	set_cursor_y_position(y)
	{
		this.element.find(".cursor > circle").attr("cy", y);
	}

	get_cursor_y_position(x)
	{
		try
		{
			// Get the data points between which x is and interpolate
			// where cursor circle should go on the y axis
			for (var i = 0; i < this.points.length; i++)
			{
				// Convert points[i].x to percentage and compare to x
				if (this.points[i].x / 5 > x)
				{
					// If i <=0 we don't have points[i-1], have to use points[i]
					let x1 = (i <= 0) ? this.points[i].x : this.points[i-1].x;
					let y1 = (i <= 0) ? this.points[i].y : this.points[i-1].y;

					// points[i] should exist, or this would have already crashed
					let x2 = this.points[i].x;
					let y2 = this.points[i].y;

					// d = Δ = delta = change
					let dx = x2 - x1;
					let dy = y2 - y1;

					// x is x converted to svg points - last x coordinate
					x = x * 5 - x1;

					// Calculate desired y position between given x coordinates
					let y = y1 + (x / dx) * dy

					return y;

					break; // The for loop shouldn't just go on
				}
			}
		}
		catch (error)
		{
			if (debug) {console.log(error);}
			throw error;
		}
	}

	set_cursor_position(x, y = get_cursor_y_position(x))
	{
		try
		{
			x = this.get_cursor_x_position(x)

			this.set_cursor_x_position(x);
			this.set_cursor_y_position(y);
		}
		catch (error)
		{
			if (debug) {console.log(error);}
			throw error;
		}
	}

	handle_mouse_enter(event)
	{
		try
		{
			event.preventDefault();

			// Enable cursor on click
			this.cursor_lock = this.cursor_lock ? false : true;
			// this.context.set_cursor_position(event.pageX - $(this).offset().left);
		}
		catch (error)
		{
			if (debug) {console.log(error);}
			throw error;
		}
	}

	handle_mouse_leave(event)
	{
		try
		{
			event.preventDefault();

			// Disable cursor if mouse leaves element
			// Touchend should not disable cursor!
			if (!this.cursor_lock & event.type == "mouseleave")
			{
				$(this).find(".cursor").hide();
			}
		}
		catch (error)
		{
			if (debug) {console.log(error);}
			throw error;
		}
	}

	handle_mouse_move(event)
	{
		try
		{
			event.preventDefault();

			// Move cursor only if it's not locked
			if (!this.cursor_lock)
			{
				let x = 0;

				// Depending on event type x is defined differently
				if (event.type == "mousemove")
				{
					// mousemove event has pageX property available like this
					x = event.pageX - $(this).offset().left;
				}
				else if (event.type == "touchmove")
				{
					// touchmove somehow is much more complex, and requires this
					x = event.originalEvent.touches[0].pageX - $(this).offset().left;
				}

				// Limit cursor between 1 and element.width - 1, to
				// prevent cursor line from clipping of the edges
				x = Math.min(Math.max(x, 1), $(this).width() - 1);

				this.context.set_cursor_position(x);
			}
		}
		catch (error)
		{
			if (debug) {console.log(error);}
			throw error;
		}
	}

	initialize()
	{
		try
		{
			this.context = this; // Can't use 'this' inside callbacks sometimes

			this.cursor_lock = false;

			// Add event-handlers

			// Enable cursor upon entering element
			this.element.on("touchstart mouseenter", function(event)
			{
				this.handle_mouse_enter(event); // event is forwarded to callback
				// only when using an anonymous function, so I have to do this.
			});

			// Toggle cursor upon exiting element
			this.element.on("touchend mouseleave", function(event)
			{
				this.handle_mouse_leave(event);
			});

			// Move cursor upon mouse movement over element
			this.element.on("touchmove mousemove", function(event)
			{
				this.handle_mouse_move(event);
			});
		}
		catch (error)
		{
			if (debug) {console.log(error);}
			throw error;
		}
	}
}

let test = new Graph($("div.graph-container#demo1"));
