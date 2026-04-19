
module pwm_generator(
    input clk_3125KHz,
    input [3:0] duty_cycle,
    output reg clk_195KHz, pwm_signal
);

initial begin
    clk_195KHz = 0; pwm_signal = 1;
end
//////////////////DO NOT MAKE ANY CHANGES ABOVE THIS LINE //////////////////
reg [2:0] div_cnt  = 3'd0;
reg [3:0] pwm_cnt  = 4'd0;

always @(posedge clk_3125KHz) begin
    if (!div_cnt) clk_195KHz <= ~clk_195KHz;
    div_cnt <= div_cnt + 1'b1;
    pwm_cnt <= pwm_cnt + 4'd1;
    pwm_signal <= (pwm_cnt < duty_cycle);
end

//////////////////DO NOT MAKE ANY CHANGES BELOW THIS LINE //////////////////

endmodule
